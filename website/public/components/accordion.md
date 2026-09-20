# Accordion

Collapsible content sections for organising related information.

Generated from the @robr0/design-system registry and prop JSDoc, version 0.21.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://robertritacca.com/api/mcp.

- Category: data-display
- Import: `import { Accordion } from '@robr0/design-system';`
- Deep import: `import { Accordion } from '@robr0/design-system/components/Accordion/Accordion';`
- Rendering: client component (declares 'use client')
- Live docs: https://robertritacca.com/components/accordion

## Accordion props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| items | `AccordionItem[]` | yes |  | List of accordion items |
| multiple | `boolean` | no | `false` | Allow multiple items open at once |
| defaultExpanded | `string[]` | no | `[]` | IDs of initially expanded items |
| className | `string` | no | `` | Additional CSS classes |
