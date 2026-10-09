/**
 * The file-type model behind the attachment family: what kind of file a
 * name and mime type describe, the short label its type mark wears, and the
 * small formatting helpers a tile needs. No React and no browser APIs, so a
 * server component, a route handler or a test can import it directly.
 *
 * Four kinds are "well known" and carry a colour role of their own (the
 * `--color-file-*` tokens): pdf, spreadsheet, document and presentation.
 * Every other kind is neutral and wears its extension as a badge, so colour
 * stays a signal for the formats a reader recognises at a glance.
 */

/** What kind of file an attachment is. */
export type FileKind =
  | 'pdf'
  | 'document'
  | 'spreadsheet'
  | 'presentation'
  | 'image'
  | 'audio'
  | 'video'
  | 'archive'
  | 'code'
  | 'text'
  | 'pasted'
  | 'generic';

/** Where an attachment is in its life: usable, on its way, failed, or gone. */
export type AttachmentStatus = 'ready' | 'uploading' | 'error' | 'unavailable';

/** What a kind looks like on a tile. */
export interface FileKindMeta {
  /** Reader-facing name of the kind, used in accessible names. */
  label: string;
  /** Short uppercase label on the type mark when the extension gives none. */
  mark: string;
  /** Whether the kind has a colour role of its own; the rest are neutral. */
  colored: boolean;
  /** Material Symbol standing for the kind in a plain list row. */
  icon: string;
}

export const FILE_KINDS: Record<FileKind, FileKindMeta> = {
  pdf: { label: 'PDF', mark: 'PDF', colored: true, icon: 'picture_as_pdf' },
  document: {
    label: 'Document',
    mark: 'DOC',
    colored: true,
    icon: 'description',
  },
  spreadsheet: {
    label: 'Spreadsheet',
    mark: 'XLS',
    colored: true,
    icon: 'table',
  },
  presentation: {
    label: 'Presentation',
    mark: 'PPT',
    colored: true,
    icon: 'co_present',
  },
  image: { label: 'Image', mark: 'IMG', colored: false, icon: 'image' },
  audio: { label: 'Audio', mark: 'AUDIO', colored: false, icon: 'graphic_eq' },
  video: { label: 'Video', mark: 'VIDEO', colored: false, icon: 'movie' },
  archive: {
    label: 'Archive',
    mark: 'ZIP',
    colored: false,
    icon: 'folder_zip',
  },
  code: { label: 'Code', mark: 'CODE', colored: false, icon: 'code' },
  text: { label: 'Text', mark: 'TXT', colored: false, icon: 'notes' },
  pasted: {
    label: 'Pasted text',
    mark: 'PASTED',
    colored: false,
    icon: 'content_paste',
  },
  generic: { label: 'File', mark: 'FILE', colored: false, icon: 'draft' },
};

/** Extension to kind. The extension is the stronger signal: browsers report
    an empty or generic mime type for many office and code files. */
const EXTENSION_KINDS: Record<string, FileKind> = {
  pdf: 'pdf',
  doc: 'document',
  docx: 'document',
  odt: 'document',
  rtf: 'document',
  pages: 'document',
  xls: 'spreadsheet',
  xlsx: 'spreadsheet',
  xlsm: 'spreadsheet',
  csv: 'spreadsheet',
  tsv: 'spreadsheet',
  ods: 'spreadsheet',
  numbers: 'spreadsheet',
  ppt: 'presentation',
  pptx: 'presentation',
  odp: 'presentation',
  png: 'image',
  jpg: 'image',
  jpeg: 'image',
  gif: 'image',
  webp: 'image',
  avif: 'image',
  svg: 'image',
  bmp: 'image',
  heic: 'image',
  tiff: 'image',
  mp3: 'audio',
  wav: 'audio',
  m4a: 'audio',
  ogg: 'audio',
  flac: 'audio',
  aac: 'audio',
  mp4: 'video',
  mov: 'video',
  webm: 'video',
  mkv: 'video',
  avi: 'video',
  zip: 'archive',
  tar: 'archive',
  gz: 'archive',
  tgz: 'archive',
  rar: 'archive',
  '7z': 'archive',
  js: 'code',
  jsx: 'code',
  ts: 'code',
  tsx: 'code',
  mjs: 'code',
  cjs: 'code',
  json: 'code',
  html: 'code',
  css: 'code',
  py: 'code',
  rb: 'code',
  go: 'code',
  rs: 'code',
  java: 'code',
  c: 'code',
  cpp: 'code',
  h: 'code',
  sh: 'code',
  sql: 'code',
  yml: 'code',
  yaml: 'code',
  xml: 'code',
  swift: 'code',
  kt: 'code',
  php: 'code',
  txt: 'text',
  md: 'text',
  log: 'text',
};

/** Mime type to kind, for a file whose name carries no known extension. */
const MIME_KINDS: [test: RegExp, kind: FileKind][] = [
  [/^application\/pdf$/, 'pdf'],
  [/^image\//, 'image'],
  [/^audio\//, 'audio'],
  [/^video\//, 'video'],
  [/spreadsheet|ms-excel|^text\/csv$/, 'spreadsheet'],
  [/presentation|ms-powerpoint/, 'presentation'],
  [/wordprocessing|msword|opendocument\.text|^application\/rtf$/, 'document'],
  [/zip|x-tar|x-7z|x-rar|gzip/, 'archive'],
  [/json|javascript|typescript|xml|^text\/(html|css|x-)/, 'code'],
  [/^text\//, 'text'],
];

/** The lower-case extension of a file name, without the dot. Empty when the
    name has none, or is a dotfile with nothing before the dot. */
export function getFileExtension(name: string): string {
  const dot = name.lastIndexOf('.');
  if (dot <= 0 || dot === name.length - 1) return '';
  return name.slice(dot + 1).toLowerCase();
}

/** The two facts about a file this module reads. A `File` satisfies it. */
export interface FileLike {
  /** File name, extension included. */
  name: string;
  /** Mime type, when the source reported one. */
  type?: string;
}

/** The kind a file is, read from its extension first and its mime type second. */
export function getFileKind(file: FileLike): FileKind {
  const byExtension = EXTENSION_KINDS[getFileExtension(file.name)];
  if (byExtension) return byExtension;
  const mime = file.type ?? '';
  if (mime !== '') {
    for (const [test, kind] of MIME_KINDS) if (test.test(mime)) return kind;
  }
  return 'generic';
}

/** Longest extension a type mark shows whole; a longer one falls back to
    the kind's own mark so the badge never outgrows the tile. */
const MAX_MARK_CHARS = 5;

/**
 * The short uppercase label a tile's type mark wears. A well-known kind
 * keeps its family mark (every word-processor file reads DOC), except where
 * the extension is itself the familiar name (CSV). Any other file wears its
 * own extension.
 */
export function getFileTypeLabel(name: string, kind: FileKind): string {
  const extension = getFileExtension(name);
  if (kind === 'pasted') return FILE_KINDS.pasted.mark;
  if (FILE_KINDS[kind].colored) {
    return extension === 'csv' || extension === 'tsv'
      ? extension.toUpperCase()
      : FILE_KINDS[kind].mark;
  }
  if (extension !== '' && extension.length <= MAX_MARK_CHARS) return extension.toUpperCase();
  return FILE_KINDS[kind].mark;
}

/**
 * Split a file name for middle truncation: the head may be ellipsized, the
 * tail (the last few characters of the stem plus the extension) always
 * shows, so a truncated name still says what the file is.
 */
export function splitFileName(name: string, tailChars = 4): { head: string; tail: string } {
  const extension = getFileExtension(name);
  const stemLength = extension === '' ? name.length : name.length - extension.length - 1;
  // A stem with nothing to spare stays whole: there is no middle to cut.
  if (stemLength <= tailChars) return { head: '', tail: name };
  const cut = stemLength - tailChars;
  return { head: name.slice(0, cut), tail: name.slice(cut) };
}

/** Render a byte count as a short human-readable string. */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, exponent);
  // Whole numbers for bytes, one decimal above that
  return `${exponent === 0 ? value : value.toFixed(1)} ${units[exponent]}`;
}

/**
 * Whether a file satisfies a native `accept` string: comma-separated
 * extensions (`.pdf`), exact mime types (`text/csv`) and wildcards
 * (`image/*`). An empty string accepts everything.
 */
export function matchesAccept(file: FileLike, accept: string): boolean {
  const rules = accept
    .split(',')
    .map((rule) => rule.trim().toLowerCase())
    .filter(Boolean);
  if (rules.length === 0) return true;
  const mime = (file.type ?? '').toLowerCase();
  const name = file.name.toLowerCase();
  return rules.some((rule) => {
    if (rule.startsWith('.')) return name.endsWith(rule);
    if (rule.endsWith('/*')) return mime.startsWith(rule.slice(0, -1));
    return mime === rule;
  });
}

/**
 * One attachment as the family passes it around: what a tile draws, what a
 * group lays out, and what `useAttachments` keeps. Plain data, so it
 * serialises and crosses the server boundary; the `File` itself stays with
 * whoever owns the upload.
 */
export interface AttachmentItem {
  /** Stable identity, unique within its list. */
  id: string;
  /** File name, extension included. */
  name: string;
  /** What kind of file it is. */
  kind: FileKind;
  /** Size in bytes. */
  size?: number;
  /** Mime type, when the source reported one. */
  mimeType?: string;
  /** Where the file is in its life. */
  status: AttachmentStatus;
  /** Upload progress, 0 to 100, while `status` is `uploading`. */
  progress?: number;
  /** Why it failed, while `status` is `error`. */
  error?: string;
  /** Image that fills the tile: an object URL for a picture, or a
      host-rendered first page for a document. */
  previewSrc?: string;
  /** Alt text for the preview. Defaults to the name. */
  previewAlt?: string;
  /** Full-size image for the viewer, when the preview is a thumbnail.
      Defaults to `previewSrc`. */
  src?: string;
  /** Intrinsic width of the preview, to reserve its shape before it loads. */
  width?: number;
  /** Intrinsic height of the preview. */
  height?: number;
  /** First lines of a pasted block, drawn as the tile's excerpt. */
  excerpt?: string;
}
