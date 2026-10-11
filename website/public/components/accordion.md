# Accordion

Collapsible content sections for organising related information.

Generated from the rift-ds registry and prop JSDoc, version 1.7.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: data-display
- Import: `import { Accordion } from 'rift-ds';`
- Deep import: `import { Accordion } from 'rift-ds/components/Accordion/Accordion';`
- Rendering: client component (declares 'use client')
- Live docs: https://rift-ds.com/components/accordion

## Accordion props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| items | `AccordionItem[]` | yes |  | List of accordion items |
| multiple | `boolean` | no | `false` | Allow multiple items open at once |
| defaultExpanded | `string[]` | no | `[]` | IDs of initially expanded items |
| className | `string` | no | `` | Additional CSS classes |
