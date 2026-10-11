'use client';

import React, { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { AttachmentTile } from '../Attachment/AttachmentTile';
import { formatBytes } from '../Attachment/fileTypes';
import type { AttachmentItem } from '../Attachment/fileTypes';
import { CircularButton } from '../CircularButton/CircularButton';
import {
  MentionMenu,
  MentionText,
  filterMentionItems,
  getMentionQuery,
  insertMention,
  mentionListboxId,
  mentionOptionId,
} from '../Mention/Mention';
import type { MentionItem, MentionSource } from '../Mention/Mention';
import '../../fonts/material-symbols.css';
import './Composer.css';

/** Props owned by Composer itself — everything else falls through to the <textarea>. */
type ComposerOwnProps = {
  /** Current value for controlled use. Pair with `onValueChange`. */
  value?: string;
  /** Initial value for uncontrolled use. */
  defaultValue?: string;
  /**
   * Convenience callback receiving the value directly.
   * Fires alongside `onChange`, which keeps the standard React event signature
   * so form libraries work unmodified.
   */
  onValueChange?: (value: string) => void;
  /**
   * Fires with the current value on Enter (without Shift) and on the send
   * button — never while `streaming`, never while a file in `files` is
   * still uploading, and never when there is nothing to send. Text is
   * enough, and so is a ready file on its own, in which case the value is
   * an empty string. Composer does not clear the value: the consumer owns
   * it and clears it after a successful submit. Shadows the native
   * `onSubmit` attribute, which never fires on a textarea anyway.
   */
  onSubmit?: (value: string) => void;
  /**
   * A response is streaming: the send button becomes a stop button, submit
   * is blocked, and Enter is inert. On a glowing composer (`aiGlow`) the
   * gradient ring also stays lit and keeps turning while this is true.
   */
  streaming?: boolean;
  /** Fires when the stop button is pressed while `streaming`. */
  onStop?: () => void;
  /** Growth cap in text rows before the textarea scrolls internally. */
  maxRows?: number;
  /**
   * While focused, the shell wears AiButton's slowly rotating gradient ring
   * and glow in place of the plain selected border — the system's "a model
   * answers here" signal, for composers whose messages are answered by one.
   * While `streaming`, the ring stays lit and turning whether or not the
   * field holds focus. Off by default.
   */
  aiGlow?: boolean;
  /**
   * Contextual note rendered as a full-width, non-interactive chip — the
   * "what the model is looking at" line a chat host pins over the message
   * ("Looking at “Page name”"). `contextPlacement` decides where it sits.
   * One line: a note too long for the shell truncates with an ellipsis.
   * Composer owns the chip's chrome; the caller passes the text.
   */
  context?: React.ReactNode;
  /**
   * Where the `context` chip sits. `inside` (the default) pins it at the very
   * top of the shell, above any attachments. `above` lifts it out of the
   * shell into its own bar a small gap above it, so it reads as what the
   * model can see rather than part of the message being typed. Either way
   * its icon starts on the shell's text rail, and a click on it focuses the
   * textarea.
   */
  contextPlacement?: 'inside' | 'above';
  /**
   * Icon at the left of the context chip — Material Symbol name (string,
   * e.g. `visibility`, `article`) or custom element (ReactNode). Decorative
   * and hidden from assistive technology — the chip's text carries the
   * meaning. None by default, matching the ai set's icon-free-unless-asked
   * convention.
   */
  contextIcon?: string | React.ReactNode;
  /**
   * The files queued on this message, drawn as a scrolling row of square
   * tiles above the textarea. Controlled by the caller: Composer draws the
   * list and reports what was added or removed, and never stores a file.
   * `useAttachments` is the usual owner.
   */
  files?: AttachmentItem[];
  /**
   * Fires with the files a person picked, pasted or dropped. Providing it
   * arms all three: the attach button and its picker, file paste in the
   * textarea, and drop on the shell.
   */
  onFilesSelected?: (files: File[]) => void;
  /** Fires with the id of the file whose remove button was pressed. Its presence renders the buttons. */
  onFileRemove?: (id: string) => void;
  /** Fires with a queued file when its tile is pressed. Its presence makes the tiles buttons. */
  onFileClick?: (item: AttachmentItem) => void;
  /** File types the picker offers, in the native `accept` syntax. */
  accept?: string;
  /** Whether the picker allows several files at once. */
  multiple?: boolean;
  /** Whether the built-in attach button shows when `onFilesSelected` is set. */
  attachButton?: boolean;
  /**
   * Pasted text at least this many characters long becomes an attachment
   * instead of landing in the textarea. Off unless set, and inert without
   * `onPasteAsAttachment`.
   */
  pasteThreshold?: number;
  /** Receives pasted text that met `pasteThreshold`. */
  onPasteAsAttachment?: (text: string) => void;
  /** Accessible label for the attach button. */
  attachLabel?: string;
  /** Text shown on the shell while files are dragged over it. */
  dropLabel?: string;
  /** Accessible label for the list of queued files. */
  filesLabel?: string;
  /**
   * Builds the sentence announced to assistive technology when files join
   * the queue, leave it, or fail.
   */
  formatFileAnnouncement?: (change: {
    type: 'added' | 'removed' | 'failed';
    names: string[];
  }) => string;
  /**
   * Free-form row rendered above the textarea, after any `files`.
   *
   * @deprecated Use `files` with `onFilesSelected` and `onFileRemove`, which draw the queue as tiles.
   */
  attachments?: React.ReactNode;
  /**
   * What a person can reference while typing, one source per trigger
   * character: `@` for entities, `/` for skills. Typing a trigger at the
   * start of a word opens a menu of that source's items, filtered as the
   * word grows. Arrows move through it, Enter or Tab writes the choice into
   * the text, Escape closes it. A mention is drawn in the tag colour
   * wherever its exact name stands in the text; the value stays a plain
   * string.
   */
  mentions?: MentionSource[];
  /** Fires with the item a person chose from the mention menu, and the trigger that opened it. */
  onMentionSelect?: (item: MentionItem, trigger: string) => void;
  /**
   * Which side of the trigger's line the mention menu opens on: `top` lays
   * it over the text above, `bottom` over the text below. `top` suits a
   * composer at the foot of a view.
   */
  mentionPlacement?: 'top' | 'bottom';
  /** Builds the sentence announced to assistive technology when the mention menu opens or its matches change. */
  formatMentionAnnouncement?: (count: number) => string;
  /** Leading actions on the left of the action bar, after the attach button (a model picker). */
  actions?: React.ReactNode;
  /**
   * Trailing actions on the right of the action bar, just before the send
   * button (dictation, voice mode).
   */
  trailingActions?: React.ReactNode;
  /** Accessible label for the send button. */
  sendLabel?: string;
  /** Accessible label for the stop button. */
  stopLabel?: string;
  /** Additional CSS classes — applied to the shell, not the <textarea>. */
  className?: string;
};

export interface ComposerProps
  extends ComposerOwnProps,
    Omit<React.ComponentPropsWithoutRef<'textarea'>, keyof ComposerOwnProps> {}

const defaultFileAnnouncement = ({
  type,
  names,
}: {
  type: 'added' | 'removed' | 'failed';
  names: string[];
}) => {
  const list = names.join(', ');
  if (type === 'added') return `Attached ${list}`;
  if (type === 'removed') return `Removed ${list}`;
  return `Could not attach ${list}`;
};

const defaultMentionAnnouncement = (count: number) =>
  count === 1 ? '1 suggestion' : `${count} suggestions`;

/* A programmatic edit has to arrive as an ordinary change, so `onChange`
   gets a genuine event and form libraries see what a keystroke would have
   shown them. Writing `node.value` cannot do that: React records the value
   it last saw through that property and would find nothing new. Replacing
   a range goes around the record, and the input event that follows is then
   read as a real edit. */
const replaceRange = (node: HTMLTextAreaElement, text: string, start: number, end: number) => {
  node.setRangeText(text, start, end, 'end');
  node.dispatchEvent(new Event('input', { bubbles: true }));
};

const dragCarriesFiles = (event: React.DragEvent) =>
  Array.from(event.dataTransfer?.types ?? []).includes('Files');

/**
 * Composer is the chat input shell: an optional context note ("Looking at
 * “Page name”"), a tray of queued files, an auto-growing textarea, a leading
 * actions slot, and a trailing send button — the one sanctioned
 * primary-action teal in the chat set, because sending a message is a
 * genuine primary CTA. While `streaming`, send becomes stop and Enter
 * is inert.
 *
 * The textarea grows with its content up to `maxRows`, then scrolls
 * internally. Where the browser supports `field-sizing: content` the sizing
 * is fully native; elsewhere a measurement effect keeps the height in step.
 * Either way the text zone glides between the two heights rather than
 * snapping — 75ms, short enough to soften the step without reading as an
 * animation. The action bar's buttons never move relative to the bar.
 *
 * Forwards a ref to the underlying `<textarea>` and spreads unrecognised
 * props onto it; `className` lands on the shell.
 */
export const Composer = React.forwardRef<HTMLTextAreaElement, ComposerProps>(
  (
    {
      value,
      defaultValue,
      onValueChange,
      onSubmit,
      streaming = false,
      onStop,
      maxRows = 8,
      aiGlow = false,
      context,
      contextIcon,
      contextPlacement = 'inside',
      files,
      onFilesSelected,
      onFileRemove,
      onFileClick,
      accept,
      multiple = true,
      attachButton = true,
      pasteThreshold,
      onPasteAsAttachment,
      attachLabel = 'Attach files',
      dropLabel = 'Drop files to attach',
      filesLabel = 'Attachments',
      formatFileAnnouncement = defaultFileAnnouncement,
      attachments,
      mentions,
      onMentionSelect,
      mentionPlacement = 'top',
      formatMentionAnnouncement = defaultMentionAnnouncement,
      actions,
      trailingActions,
      sendLabel = 'Send message',
      stopLabel = 'Stop generating',
      className = '',
      onChange,
      onKeyDown,
      onPaste,
      onSelect,
      onFocus,
      onBlur,
      onScroll,
      ...rest
    },
    ref,
  ) => {
    const baseClass = 'ds-composer';
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const contentRef = useRef<HTMLDivElement | null>(null);

    const isControlled = value !== undefined;
    const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue ?? '');
    const currentValue = isControlled ? value : uncontrolledValue;

    const disabled = Boolean(rest.disabled);
    const queued = files ?? [];
    const hasFiles = queued.length > 0;
    const armed = Boolean(onFilesSelected);
    /* A message is text, files, or both. A file still uploading holds the
       send back: sending now would leave it behind. */
    const anyUploading = queued.some((file) => file.status === 'uploading');
    const anyReady = queued.some((file) => file.status === 'ready');
    const canSend = !disabled && !anyUploading && (currentValue.trim() !== '' || anyReady);

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const trayRef = useRef<HTMLUListElement | null>(null);
    const [dragging, setDragging] = useState(false);
    const dragDepth = useRef(0);
    const [announcement, setAnnouncement] = useState('');

    /* Mentions. Nothing is stored beside the text: the trigger being typed
       is read from the value and the caret on every render, and a finished
       mention is recognised wherever its name stands. */
    const mentionSources = mentions ?? [];
    const mentionsArmed = mentionSources.length > 0;
    const mentionMenuId = useId();
    const backdropTextRef = useRef<HTMLDivElement | null>(null);
    const shellRef = useRef<HTMLDivElement | null>(null);
    const mentionMenuRef = useRef<HTMLDivElement | null>(null);
    const [caret, setCaret] = useState<number | null>(null);
    const [focused, setFocused] = useState(false);
    const [activeMention, setActiveMention] = useState(0);
    /* Escape closes the menu for the trigger it was opened on, remembered by
       position, so the menu stays shut while that word is finished and opens
       again for the next trigger. */
    const [dismissedAt, setDismissedAt] = useState<number | null>(null);
    const pendingCaret = useRef<number | null>(null);

    const mentionQuery =
      mentionsArmed && focused && !disabled && caret !== null
        ? getMentionQuery(
            currentValue,
            caret,
            mentionSources.map((source) => source.trigger),
          )
        : null;
    const mentionSource = mentionQuery
      ? mentionSources.find((source) => source.trigger === mentionQuery.trigger)
      : undefined;
    const mentionMatches =
      mentionQuery && mentionSource
        ? filterMentionItems(mentionSource.items, mentionQuery.query)
        : [];
    const choosable = mentionMatches.filter((item) => !item.disabled);
    const mentionOpen =
      mentionQuery !== null && choosable.length > 0 && dismissedAt !== mentionQuery.start;
    const activeItem = mentionOpen
      ? choosable[Math.min(activeMention, choosable.length - 1)]
      : undefined;

    /** Keep the internal ref (used for auto-grow) while honouring a forwarded one. */
    const setTextareaRef = (node: HTMLTextAreaElement | null) => {
      textareaRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    };

    useLayoutEffect(() => {
      const node = textareaRef.current;
      if (!node) return;
      // Native sizing takes over where supported — see the @supports block in the CSS.
      if (typeof CSS !== 'undefined' && CSS.supports('field-sizing', 'content')) return;
      node.style.height = 'auto';
      node.style.height = `${node.scrollHeight}px`;
    }, [currentValue]);

    /* The text zone animates between heights (see the transition in the CSS),
       which needs the measured height as a number rather than `auto`. A
       ResizeObserver publishes it on every cause at once: a wrapped or deleted
       line, a clear after send, and a rewrap when the shell changes width. */
    useLayoutEffect(() => {
      const node = textareaRef.current;
      const content = contentRef.current;
      if (!node || !content) return;
      const observer = new ResizeObserver(() => {
        content.style.setProperty('--ds-composer-text-height', `${node.offsetHeight}px`);
        // The mention overlay wraps at the textarea's own measure
        content.style.setProperty('--ds-composer-text-width', `${node.clientWidth}px`);
      });
      observer.observe(node);
      return () => observer.disconnect();
    }, []);

    /* The overlay that draws the mentions has to wrap and scroll exactly as
       the textarea does. Its width is the textarea's client width, which
       narrows when a scrollbar appears at the row cap without the box itself
       resizing, so it is read again on every value change. A caret waiting
       from a just-written mention lands here too, once the new value is in. */
    useLayoutEffect(() => {
      const node = textareaRef.current;
      if (!node) return;
      if (pendingCaret.current !== null) {
        const next = pendingCaret.current;
        pendingCaret.current = null;
        node.setSelectionRange(next, next);
        setCaret(next);
      }
      if (!mentionsArmed) return;
      contentRef.current?.style.setProperty('--ds-composer-text-width', `${node.clientWidth}px`);
      if (backdropTextRef.current) {
        backdropTextRef.current.style.transform = `translateY(${-node.scrollTop}px)`;
      }
    }, [currentValue, mentionsArmed]);

    /* The menu opens from the trigger that called it, not from the shell's
       corner: it sits directly over (or under) the line the trigger is on,
       with its first column of content lined up on the trigger character,
       held inside the shell's own width. A textarea
       cannot say where one of its characters sits, but the overlay holds
       the same string in the same place, so the position is read there. */
    const mentionStart = mentionOpen && mentionQuery ? mentionQuery.start : null;
    useLayoutEffect(() => {
      const menu = mentionMenuRef.current;
      const shell = shellRef.current;
      const overlay = backdropTextRef.current;
      if (mentionStart === null || !menu || !shell || !overlay) return;
      const walker = document.createTreeWalker(overlay, NodeFilter.SHOW_TEXT);
      let remaining = mentionStart;
      let node = walker.nextNode();
      while (node && remaining >= (node.textContent ?? '').length) {
        remaining -= (node.textContent ?? '').length;
        node = walker.nextNode();
      }
      if (!node) return;
      const range = document.createRange();
      range.setStart(node, remaining);
      range.setEnd(node, remaining + 1);
      const triggerBox = range.getBoundingClientRect();
      const triggerLeft = triggerBox.left;
      const shellBox = shell.getBoundingClientRect();
      const menuBox = menu.getBoundingClientRect();
      // Where a row's content begins inside the menu: its border and insets
      const firstCell = menu.querySelector('[role="option"] > *');
      const inset = firstCell ? firstCell.getBoundingClientRect().left - menuBox.left : 0;
      const room = Math.max(0, shell.clientWidth - menu.offsetWidth);
      const left = Math.min(Math.max(0, triggerLeft - shellBox.left - shell.clientLeft - inset), room);
      menu.style.left = `${left}px`;
      // The trigger's line, measured from the shell's padding box, which is
      // what the menu's own offsets are measured from. The stylesheet turns
      // these into the menu's edge for whichever side it opens on.
      const origin = shellBox.top + shell.clientTop;
      menu.style.setProperty('--ds-composer-mention-line-top', `${triggerBox.top - origin}px`);
      menu.style.setProperty(
        '--ds-composer-mention-line-bottom',
        `${triggerBox.bottom - origin}px`,
      );
    }, [mentionStart, currentValue]);

    /* Say what changed in the queue. The tiles appear and vanish silently
       for a screen-reader user otherwise: a paste or a drop moves no focus. */
    const previousFiles = useRef<AttachmentItem[]>(queued);
    const announceRef = useRef(formatFileAnnouncement);
    announceRef.current = formatFileAnnouncement;
    useEffect(() => {
      const before = previousFiles.current;
      const now = files ?? [];
      previousFiles.current = now;
      if (before === now) return;
      const beforeById = new Map(before.map((file) => [file.id, file]));
      const nowIds = new Set(now.map((file) => file.id));
      const added = now.filter((file) => !beforeById.has(file.id)).map((file) => file.name);
      const removed = before.filter((file) => !nowIds.has(file.id)).map((file) => file.name);
      const failed = now
        .filter((file) => file.status === 'error' && beforeById.get(file.id)?.status !== 'error')
        .map((file) => file.name);
      const parts = [
        failed.length > 0 ? announceRef.current({ type: 'failed', names: failed }) : '',
        added.length > 0 ? announceRef.current({ type: 'added', names: added }) : '',
        removed.length > 0 ? announceRef.current({ type: 'removed', names: removed }) : '',
      ].filter(Boolean);
      if (parts.length > 0) setAnnouncement(parts.join('. '));
    }, [files]);

    /* Removing the focused tile would drop focus to the document. It moves
       to the tile that took its place, or back to the textarea when the
       queue empties. */
    const focusAfterRemove = useRef<number | null>(null);
    useEffect(() => {
      const index = focusAfterRemove.current;
      if (index === null) return;
      focusAfterRemove.current = null;
      const buttons = trayRef.current?.querySelectorAll<HTMLButtonElement>(
        '.ds-attachment-tile__remove',
      );
      const next = buttons?.[Math.min(index, (buttons?.length ?? 0) - 1)];
      if (next) next.focus();
      else textareaRef.current?.focus();
    }, [files]);

    const handleFileRemove = (id: string, index: number) => {
      focusAfterRemove.current = index;
      onFileRemove?.(id);
    };

    const handlePick = (event: React.ChangeEvent<HTMLInputElement>) => {
      const picked = Array.from(event.target.files ?? []);
      // Reset so picking the same file again still fires a change
      event.target.value = '';
      if (picked.length > 0) onFilesSelected?.(picked);
    };

    const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
      onPaste?.(event);
      if (event.defaultPrevented) return;
      const pasted = Array.from(event.clipboardData?.files ?? []);
      if (armed && pasted.length > 0) {
        event.preventDefault();
        onFilesSelected?.(pasted);
        return;
      }
      if (pasteThreshold === undefined || !onPasteAsAttachment) return;
      const text = event.clipboardData?.getData('text/plain') ?? '';
      if (text.length >= pasteThreshold) {
        event.preventDefault();
        onPasteAsAttachment(text);
      }
    };

    /* Drop on the shell. A drag that carries files is taken here and goes
       no further, so a drop target around the composer (a page-level one,
       say) does not handle the same files a second time. */
    const takesDrag = (event: React.DragEvent) => armed && !disabled && dragCarriesFiles(event);

    const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
      if (!takesDrag(event)) return;
      event.preventDefault();
      event.stopPropagation();
      dragDepth.current += 1;
      setDragging(true);
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
      if (!takesDrag(event)) return;
      // Without this the browser refuses the drop and opens the file instead
      event.preventDefault();
      event.stopPropagation();
      event.dataTransfer.dropEffect = 'copy';
    };

    const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
      if (!takesDrag(event)) return;
      event.stopPropagation();
      dragDepth.current = Math.max(0, dragDepth.current - 1);
      if (dragDepth.current === 0) setDragging(false);
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
      if (!takesDrag(event)) return;
      event.preventDefault();
      event.stopPropagation();
      dragDepth.current = 0;
      setDragging(false);
      const dropped = Array.from(event.dataTransfer.files ?? []);
      if (dropped.length > 0) onFilesSelected?.(dropped);
    };

    const submit = () => {
      if (streaming || !canSend) return;
      onSubmit?.(currentValue);
    };

    const readCaret = (node: HTMLTextAreaElement) =>
      node.selectionStart === node.selectionEnd ? node.selectionStart : null;

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (!isControlled) setUncontrolledValue(e.target.value);
      if (mentionsArmed) {
        setCaret(readCaret(e.target));
        // A new query starts its list from the top
        setActiveMention(0);
      }
      onChange?.(e);
      onValueChange?.(e.target.value);
    };

    const handleSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
      onSelect?.(e);
      if (!mentionsArmed) return;
      const next = readCaret(e.currentTarget);
      setCaret(next);
      // Leaving the dismissed word forgets the dismissal
      if (dismissedAt !== null && next !== null) {
        const query = getMentionQuery(
          e.currentTarget.value,
          next,
          mentionSources.map((source) => source.trigger),
        );
        if (query?.start !== dismissedAt) setDismissedAt(null);
      }
    };

    const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      onFocus?.(e);
      setFocused(true);
      if (mentionsArmed) setCaret(readCaret(e.currentTarget));
    };

    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      onBlur?.(e);
      setFocused(false);
    };

    const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
      onScroll?.(e);
      // Written straight to the node: a scroll must not cost a render
      if (backdropTextRef.current) {
        backdropTextRef.current.style.transform = `translateY(${-e.currentTarget.scrollTop}px)`;
      }
    };

    const chooseMention = (item: MentionItem) => {
      const node = textareaRef.current;
      if (!node || !mentionQuery) return;
      const next = insertMention(currentValue, mentionQuery, item);
      pendingCaret.current = next.caret;
      // Only the typed query is replaced; the text either side is the same string
      const tail = currentValue.length - mentionQuery.end;
      replaceRange(
        node,
        next.value.slice(mentionQuery.start, next.value.length - tail),
        mentionQuery.start,
        mentionQuery.end,
      );
      onMentionSelect?.(item, mentionQuery.trigger);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      onKeyDown?.(e);
      if (mentionOpen && activeItem && mentionQuery && !e.nativeEvent.isComposing) {
        const at = choosable.indexOf(activeItem);
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          const step = e.key === 'ArrowDown' ? 1 : -1;
          setActiveMention((at + step + choosable.length) % choosable.length);
          return;
        }
        if ((e.key === 'Enter' && !e.shiftKey) || e.key === 'Tab') {
          e.preventDefault();
          chooseMention(activeItem);
          return;
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          // The menu takes this Escape; a dialog around the composer stays open
          e.stopPropagation();
          setDismissedAt(mentionQuery.start);
          return;
        }
      }
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        // Inert while streaming or trimmed-empty — submit() guards both.
        submit();
      }
    };

    /* The whole shell is the input affordance: clicking anywhere that is not
       a control focuses the textarea, so the click target is the visible
       shape rather than the text line inside it. */
    const handleShellClick = (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;
      if (target.closest('button, a, textarea, input, select, [role="button"]')) return;
      textareaRef.current?.focus();
    };

    const classes = [
      baseClass,
      aiGlow ? `${baseClass}--ai-glow` : '',
      streaming ? `${baseClass}--streaming` : '',
      disabled ? `${baseClass}--disabled` : '',
      dragging ? `${baseClass}--dragging` : '',
      mentionsArmed ? `${baseClass}--mentions` : '',
      // The above placement moves the text onto the chip's rail; the shell
      // needs to know, since the chip is no longer inside it.
      context && contextPlacement === 'above' ? `${baseClass}--context-above` : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    // The textarea needs an accessible name; default one in when the caller
    // provides neither aria-label nor aria-labelledby.
    const ariaLabel =
      rest['aria-label'] ?? (rest['aria-labelledby'] !== undefined ? undefined : 'Message');

    /* One chip, placed by contextPlacement: inside the shell, where the
       shell's click handler already covers it, or above it as a sibling bar
       carrying the same handler, so a click still focuses the textarea. */
    const contextAbove = contextPlacement === 'above';
    const contextChip = context ? (
      <div
        className={`${baseClass}__context${contextAbove ? ` ${baseClass}__context--above` : ''}`}
        onClick={contextAbove ? handleShellClick : undefined}
      >
        {contextIcon && (
          <span className={`${baseClass}__context-icon`} aria-hidden="true">
            {typeof contextIcon === 'string' ? (
              <span className="material-symbols-rounded">{contextIcon}</span>
            ) : (
              contextIcon
            )}
          </span>
        )}
        <span className={`${baseClass}__context-text`}>{context}</span>
      </div>
    ) : null;

    const shell = (
      <div
        ref={shellRef}
        className={classes}
        style={{ '--ds-composer-max-rows': maxRows } as React.CSSProperties}
        onClick={handleShellClick}
        onDragEnter={armed ? handleDragEnter : undefined}
        onDragOver={armed ? handleDragOver : undefined}
        onDragLeave={armed ? handleDragLeave : undefined}
        onDrop={armed ? handleDrop : undefined}
      >
        {!contextAbove && contextChip}

        {hasFiles && (
          <ul className={`${baseClass}__tray`} ref={trayRef} aria-label={filesLabel}>
            {queued.map((file, index) => (
              <li key={file.id} className={`${baseClass}__tray-item`}>
                <AttachmentTile
                  name={file.name}
                  kind={file.kind}
                  status={file.status}
                  progress={file.progress}
                  error={file.error}
                  previewSrc={file.previewSrc}
                  previewAlt={file.previewAlt}
                  excerpt={file.excerpt}
                  meta={file.size === undefined ? undefined : formatBytes(file.size)}
                  onClick={onFileClick ? () => onFileClick(file) : undefined}
                  onRemove={
                    onFileRemove && !disabled ? () => handleFileRemove(file.id, index) : undefined
                  }
                />
              </li>
            ))}
          </ul>
        )}

        {attachments && <div className={`${baseClass}__attachments`}>{attachments}</div>}

        <div className={`${baseClass}__content`} ref={contentRef}>
          <textarea
            {...rest}
            ref={setTextareaRef}
            className={`${baseClass}__textarea`}
            rows={1}
            value={currentValue}
            aria-label={ariaLabel}
            aria-autocomplete={mentionsArmed ? 'list' : undefined}
            aria-controls={mentionOpen ? mentionListboxId(mentionMenuId) : undefined}
            aria-activedescendant={
              activeItem ? mentionOptionId(mentionMenuId, activeItem.id) : undefined
            }
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onSelect={handleSelect}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onScroll={handleScroll}
          />
          {mentionsArmed && (
            /* The words a person sees. The textarea beneath keeps the caret,
               the selection and every keystroke, with its own text
               transparent; this copy of the same string is where a mention
               gets its colour. Decorative: the textarea is the control. */
            <div className={`${baseClass}__backdrop`} aria-hidden="true">
              <div className={`${baseClass}__backdrop-text`} ref={backdropTextRef}>
                <MentionText text={currentValue} sources={mentionSources} />
              </div>
            </div>
          )}
        </div>

        {mentionOpen && activeItem && mentionQuery && (
          <MentionMenu
            ref={mentionMenuRef}
            id={mentionMenuId}
            className={`${baseClass}__mention-menu ${baseClass}__mention-menu--${mentionPlacement}`}
            items={mentionMatches}
            activeId={activeItem.id}
            query={mentionQuery.query}
            label={mentionSource?.label}
            onActiveChange={(id) =>
              setActiveMention(Math.max(0, choosable.findIndex((item) => item.id === id)))
            }
            onSelect={chooseMention}
          />
        )}

        <div className={`${baseClass}__footer`}>
          {(actions || (armed && attachButton)) && (
            <div className={`${baseClass}__actions`}>
              {armed && attachButton && (
                <CircularButton
                  icon="add"
                  variant="tertiary"
                  ariaLabel={attachLabel}
                  disabled={disabled}
                  onClick={() => fileInputRef.current?.click()}
                />
              )}
              {actions}
            </div>
          )}
          <div className={`${baseClass}__trailing`}>
            {trailingActions}
            {streaming ? (
              <CircularButton
                icon="stop"
                variant="primary"
                ariaLabel={stopLabel}
                disabled={disabled}
                onClick={onStop}
              />
            ) : (
              <CircularButton
                icon="arrow_upward"
                variant="primary"
                ariaLabel={sendLabel}
                disabled={!canSend}
                onClick={submit}
              />
            )}
          </div>
        </div>

        {armed && (
          <>
            {/* The picker behind the attach button. Out of the tab order and
                the accessibility tree: the button is the control. */}
            <input
              ref={fileInputRef}
              className={`${baseClass}__file-input`}
              type="file"
              accept={accept}
              multiple={multiple}
              tabIndex={-1}
              aria-hidden="true"
              onChange={handlePick}
            />
            {/* Decorative: the words describe a pointer gesture in progress */}
            <div className={`${baseClass}__drop-hint`} aria-hidden="true">
              {dropLabel}
            </div>
          </>
        )}

        {(armed || hasFiles) && (
          <span className={`${baseClass}__sr-only`} role="status">
            {announcement}
          </span>
        )}

        {mentionsArmed && (
          /* The menu opens without moving focus, so its arrival is said here */
          <span className={`${baseClass}__sr-only`} role="status">
            {mentionOpen ? formatMentionAnnouncement(choosable.length) : ''}
          </span>
        )}
      </div>
    );

    /* Above the shell, the bar and the shell travel as one block in a
       wrapper, so a host's own flex or grid gap can never land between
       them. The wrapper is plain layout; `className` stays on the shell. */
    if (contextAbove && contextChip) {
      return (
        <div className={`${baseClass}-group`}>
          {contextChip}
          {shell}
        </div>
      );
    }

    return shell;
  },
);

Composer.displayName = 'Composer';
