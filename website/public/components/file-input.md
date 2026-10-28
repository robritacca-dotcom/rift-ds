# File input

A click-or-drop upload zone paired with a controlled file list showing size, progress, and per-file errors.

Generated from the rift-ds registry and prop JSDoc, version 1.16.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: forms
- Import: `import { FileInput } from 'rift-ds';`
- Deep import: `import { FileInput } from 'rift-ds/components/FileInput/FileInput';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/file-input

## FileInput props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| label | `string` | no |  | Field label above the dropzone |
| placeholder | `string` | no | `Drag and drop, or click to browse` | Instructional copy inside the dropzone |
| files | `FileInputFile[]` | no | `[]` | Files to list under the dropzone |
| size | `"default" \| "compact"` | no | `default` | Component size (not the native character-width `size` attribute) |
| error | `boolean` | no | `false` | Error state — shows error styling and message |
| helperText | `string` | no |  | Helper or error message displayed below the field |
| acceptHint | `((accept: string) => string)` | no | `(acceptValue: string) => `Accepts ${acceptValue}`` | Hint shown under the placeholder when `accept` is set, given the `accept` value. Defaults to "Accepts" followed by the value. |
| onFilesSelected | `((files: File[]) => void)` | no |  | Called with the newly selected files |
| onFileRemove | `((id: string) => void)` | no |  | Called with the id of a file whose remove button was pressed |
| progressLabel | `((name: string) => string)` | no | `(fileName: string) => `Uploading ${fileName}`` | Accessible name of a listed file's progress bar, given the file name. Defaults to "Uploading" followed by the name. |
| removeLabel | `((name: string) => string)` | no | `(fileName: string) => `Remove ${fileName}`` | Accessible name of a listed file's remove button, given the file name. Defaults to "Remove" followed by the name. |
| locale | `string` | no |  | The BCP 47 locale file sizes are written in, such as `de-DE` (`1,5 MB`). Defaults to the nearest LocaleProvider's, else `en-US`. |
| className | `string` | no | `` | Additional CSS classes — applied to the wrapper, not the <input> |
| ariaLabel | `string` | no |  | Legacy accessible-name prop. Deprecated: Pass the native `aria-label` attribute instead. |
