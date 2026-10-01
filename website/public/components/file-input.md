# File input

A click-or-drop upload zone paired with a controlled file list showing size, progress, and per-file errors.

Generated from the rift-ds registry and prop JSDoc, version 1.2.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

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
| onFilesSelected | `((files: File[]) => void)` | no |  | Called with the newly selected files |
| onFileRemove | `((id: string) => void)` | no |  | Called with the id of a file whose remove button was pressed |
| className | `string` | no | `` | Additional CSS classes — applied to the wrapper, not the <input> |
| ariaLabel | `string` | no |  | Legacy accessible-name prop. Deprecated: Pass the native `aria-label` attribute instead. |
