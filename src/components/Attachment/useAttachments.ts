'use client';

/**
 * Headless state for a list of attachments: the list itself, validation of
 * what joins it, the object URLs behind image previews, and an optional
 * upload per file. It renders nothing. Composer draws the list it is handed
 * and reports what the person picked, pasted, dropped or removed; this hook
 * is the usual owner on the other side of those callbacks.
 *
 * Object URLs are the one resource here that leaks if forgotten. The hook
 * revokes each one when its item is removed, when the list is cleared and
 * when the owner unmounts. `take()` is the deliberate exception: it empties
 * the list for a send and hands the items over still alive, so the sent
 * message can keep showing its thumbnails. Whoever keeps those items calls
 * `revokeAttachmentUrls` when they are finally done with them.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { getFileKind, matchesAccept } from './fileTypes';
import type { AttachmentItem } from './fileTypes';

/** Why a file was turned away. */
export type AttachmentRejectionReason = 'type' | 'size' | 'count' | 'duplicate';

export interface AttachmentRejection {
  /** The file that did not join the list. */
  file: File;
  /** Which rule it broke. */
  reason: AttachmentRejectionReason;
}

/** What an upload function is given besides the file. */
export interface AttachmentUploadContext {
  /** Aborts when the item is removed or the list is cleared. */
  signal: AbortSignal;
  /** Report progress, 0 to 100. */
  onProgress: (percent: number) => void;
}

export interface UseAttachmentsOptions {
  /** Native `accept` string. Files outside it are rejected. */
  accept?: string;
  /** Largest file allowed, in bytes. */
  maxSize?: number;
  /** Most files the list may hold. */
  maxCount?: number;
  /** Let the same file join twice. Off by default; identity is name, size and modified time. */
  allowDuplicates?: boolean;
  /**
   * Upload one file. While it runs the item is `uploading`; resolving makes
   * it `ready`, rejecting makes it `error` with the thrown message. Omit it
   * and every file is `ready` as soon as it joins.
   */
  upload?: (file: File, context: AttachmentUploadContext) => Promise<void>;
  /** Fires with the files a call to `add` turned away. */
  onReject?: (rejections: AttachmentRejection[]) => void;
  /** Characters of a pasted block kept as its tile excerpt. */
  excerptLength?: number;
}

export interface UseAttachmentsResult {
  /** The list, in the order files joined. */
  items: AttachmentItem[];
  /** Add files; returns the ones turned away. */
  add: (files: File[]) => AttachmentRejection[];
  /** Add a block of pasted text as an attachment of its own. */
  addText: (text: string, name?: string) => void;
  /** Remove one item, aborting its upload and revoking its preview. */
  remove: (id: string) => void;
  /** Run a failed item's upload again. */
  retry: (id: string) => void;
  /** Empty the list, aborting uploads and revoking every preview. */
  clear: () => void;
  /**
   * Empty the list for a send and return what it held, previews still
   * alive. The caller now owns them: see `revokeAttachmentUrls`.
   */
  take: () => { items: AttachmentItem[]; files: File[] };
  /** The `File` behind an item, or the text of a pasted one. */
  getSource: (id: string) => File | string | undefined;
  /** True while any item is uploading. */
  isUploading: boolean;
}

/** Release the object URLs behind a list of items. Safe to call twice. */
export function revokeAttachmentUrls(items: AttachmentItem[]): void {
  for (const item of items) {
    if (item.previewSrc?.startsWith('blob:')) URL.revokeObjectURL(item.previewSrc);
  }
}

const DEFAULT_EXCERPT_LENGTH = 240;

let nextId = 0;
const createId = () => `attachment-${Date.now().toString(36)}-${(nextId++).toString(36)}`;

const fileIdentity = (file: File) => `${file.name}:${file.size}:${file.lastModified}`;

export function useAttachments(options: UseAttachmentsOptions = {}): UseAttachmentsResult {
  const [items, setItems] = useState<AttachmentItem[]>([]);

  /* The list is mirrored in a ref so `add` can validate against what is
     really there (two adds in one tick both see the first), and so the
     unmount cleanup revokes the final list rather than the first one. */
  const itemsRef = useRef<AttachmentItem[]>([]);
  const sourcesRef = useRef(new Map<string, File | string>());
  const abortsRef = useRef(new Map<string, AbortController>());
  /* Options are read when a call happens, not when the hook renders, so the
     returned functions keep one identity however the caller builds them. */
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  });

  const commit = useCallback((next: AttachmentItem[]) => {
    itemsRef.current = next;
    setItems(next);
  }, []);

  const patch = useCallback(
    (id: string, change: Partial<AttachmentItem>) => {
      // An item removed mid-upload must not be resurrected by a late callback.
      if (!itemsRef.current.some((item) => item.id === id)) return;
      commit(itemsRef.current.map((item) => (item.id === id ? { ...item, ...change } : item)));
    },
    [commit],
  );

  const startUpload = useCallback(
    (id: string, file: File) => {
      const upload = optionsRef.current.upload;
      if (!upload) return;
      const controller = new AbortController();
      abortsRef.current.set(id, controller);
      upload(file, {
        signal: controller.signal,
        onProgress: (percent) => {
          if (!controller.signal.aborted)
            patch(id, { progress: Math.max(0, Math.min(100, percent)) });
        },
      }).then(
        () => {
          if (controller.signal.aborted) return;
          abortsRef.current.delete(id);
          patch(id, { status: 'ready', progress: undefined, error: undefined });
        },
        (reason: unknown) => {
          if (controller.signal.aborted) return;
          abortsRef.current.delete(id);
          patch(id, {
            status: 'error',
            progress: undefined,
            error: reason instanceof Error && reason.message !== '' ? reason.message : undefined,
          });
        },
      );
    },
    [patch],
  );

  const add = useCallback(
    (files: File[]): AttachmentRejection[] => {
      const { accept, maxSize, maxCount, allowDuplicates, upload, onReject } = optionsRef.current;
      const rejections: AttachmentRejection[] = [];
      const accepted: { item: AttachmentItem; file: File }[] = [];
      const known = new Set<string>();
      for (const source of sourcesRef.current.values()) {
        if (typeof source !== 'string') known.add(fileIdentity(source));
      }

      for (const file of files) {
        if (accept && !matchesAccept(file, accept)) {
          rejections.push({ file, reason: 'type' });
        } else if (maxSize !== undefined && file.size > maxSize) {
          rejections.push({ file, reason: 'size' });
        } else if (!allowDuplicates && known.has(fileIdentity(file))) {
          rejections.push({ file, reason: 'duplicate' });
        } else if (
          maxCount !== undefined &&
          itemsRef.current.length + accepted.length >= maxCount
        ) {
          rejections.push({ file, reason: 'count' });
        } else {
          known.add(fileIdentity(file));
          const kind = getFileKind(file);
          accepted.push({
            file,
            item: {
              id: createId(),
              name: file.name,
              kind,
              size: file.size,
              mimeType: file.type || undefined,
              status: upload ? 'uploading' : 'ready',
              previewSrc: kind === 'image' ? URL.createObjectURL(file) : undefined,
            },
          });
        }
      }

      if (accepted.length > 0) {
        for (const { item, file } of accepted) sourcesRef.current.set(item.id, file);
        commit([...itemsRef.current, ...accepted.map(({ item }) => item)]);
        for (const { item, file } of accepted) startUpload(item.id, file);
      }
      if (rejections.length > 0) onReject?.(rejections);
      return rejections;
    },
    [commit, startUpload],
  );

  const addText = useCallback(
    (text: string, name = 'Pasted text') => {
      const { maxCount, excerptLength = DEFAULT_EXCERPT_LENGTH } = optionsRef.current;
      if (maxCount !== undefined && itemsRef.current.length >= maxCount) return;
      const id = createId();
      sourcesRef.current.set(id, text);
      commit([
        ...itemsRef.current,
        {
          id,
          name,
          kind: 'pasted',
          // Bytes, not characters: the size line should match what a file of
          // this text would weigh.
          size: new Blob([text]).size,
          mimeType: 'text/plain',
          status: 'ready',
          excerpt: text.trim().slice(0, excerptLength),
        },
      ]);
    },
    [commit],
  );

  const release = useCallback((dropped: AttachmentItem[]) => {
    for (const item of dropped) {
      abortsRef.current.get(item.id)?.abort();
      abortsRef.current.delete(item.id);
      sourcesRef.current.delete(item.id);
    }
    revokeAttachmentUrls(dropped);
  }, []);

  const remove = useCallback(
    (id: string) => {
      const dropped = itemsRef.current.filter((item) => item.id === id);
      if (dropped.length === 0) return;
      release(dropped);
      commit(itemsRef.current.filter((item) => item.id !== id));
    },
    [commit, release],
  );

  const retry = useCallback(
    (id: string) => {
      const source = sourcesRef.current.get(id);
      if (source === undefined || typeof source === 'string') return;
      if (!optionsRef.current.upload) return;
      patch(id, { status: 'uploading', progress: undefined, error: undefined });
      startUpload(id, source);
    },
    [patch, startUpload],
  );

  const clear = useCallback(() => {
    release(itemsRef.current);
    commit([]);
  }, [commit, release]);

  const take = useCallback(() => {
    const taken = itemsRef.current;
    const files: File[] = [];
    for (const item of taken) {
      const source = sourcesRef.current.get(item.id);
      if (source !== undefined && typeof source !== 'string') files.push(source);
      abortsRef.current.get(item.id)?.abort();
    }
    abortsRef.current.clear();
    sourcesRef.current.clear();
    commit([]);
    return { items: taken, files };
  }, [commit]);

  const getSource = useCallback((id: string) => sourcesRef.current.get(id), []);

  /* Unmount: nothing may outlive the owner. The refs are read inside the
     cleanup on purpose, since the point is the list as it stands at the end. */
  useEffect(() => {
    const aborts = abortsRef.current;
    return () => {
      for (const controller of aborts.values()) controller.abort();
      aborts.clear();
      revokeAttachmentUrls(itemsRef.current);
      itemsRef.current = [];
    };
  }, []);

  return {
    items,
    add,
    addText,
    remove,
    retry,
    clear,
    take,
    getSource,
    isUploading: items.some((item) => item.status === 'uploading'),
  };
}
