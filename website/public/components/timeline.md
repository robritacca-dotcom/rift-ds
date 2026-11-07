# Timeline

Ordered sequences: histories and steppers.

Generated from the rift-ds registry and prop JSDoc, version 1.25.0. The same data ships in the package's .d.ts and is served by the MCP endpoint at https://rift-ds.com/api/mcp.

- Category: data-display
- Import: `import { Timeline } from 'rift-ds';`
- Deep import: `import { Timeline } from 'rift-ds/components/Timeline/Timeline';`
- Rendering: server-renderable (no 'use client')
- Live docs: https://rift-ds.com/components/timeline
- Schema: https://rift-ds.com/schema/components/timeline.json (JSON, validates against https://rift-ds.com/schema/component.schema.json)

## Timeline props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| variant | `"default" \| "company"` | no |  | Which layout the timeline draws. Omitted or `default`: a flat sequence of steps or events with dot, number or icon markers. `company`: roles grouped under a company logo, for résumé and pipeline histories. |
| items | `TimelineItem[] \| TimelineCompany[]` | yes |  | The entries, in order. Their shape follows `variant`: in the default layout, steps or events (`TimelineItem`). In the `company` layout, companies with their roles (`TimelineCompany`). |
| orientation | `"horizontal" \| "vertical"` | no | `vertical` | `vertical` timeline (default) or `horizontal` stepper |
| numbered | `boolean` | no | `false` | Number the markers 1..n instead of dots |
| locale | `string` | no | `en-US` | The BCP 47 locale the marker numbers are written in, such as `ar-EG`. Defaults to `en-US`. Timeline can render from a Server Component, so it takes the prop alone and reads no LocaleProvider. |
| className | `string` | no | `` | Additional CSS classes |
| presentLabel | `string` | no | `Present` | Text shown in place of the end date for a role marked `present` |
