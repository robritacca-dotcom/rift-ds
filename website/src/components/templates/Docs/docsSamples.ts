/**
 * The docs template's code and text samples, apart from the client
 * component so the route (a Server Component) can highlight them at build
 * time.
 */

/** The usage example, highlighted by the route. */
export const USAGE = `import { Button } from 'halyard-ui';

export function SaveBar({ onSave, onCancel }) {
  return (
    <div className="save-bar">
      <Button variant="secondary" onClick={onCancel}>
        Cancel
      </Button>
      <Button variant="primary" onClick={onSave}>
        Save changes
      </Button>
    </div>
  );
}`;

/** The variants example, highlighted by the route. */
export const VARIANTS = `<Button variant="primary">Publish</Button>
<Button variant="secondary">Preview</Button>
<Button variant="tertiary">Discard draft</Button>`;

/** The page as Markdown, what "Copy page" puts on the clipboard and the agents dialog shows. */
export const PAGE_MARKDOWN = `# Button

Starts an action: saving a form, sending a message, opening a dialog.

Use a Button when pressing it does something on this page. Use a Link when it takes the reader somewhere else.

## Installation

\`\`\`bash
npx halyard-ui add button
\`\`\`

## Usage

\`\`\`tsx
import { Button } from 'halyard-ui';

<Button variant="primary" onClick={onSave}>Save changes</Button>
\`\`\`

## Variants

- primary: the one main action in a view.
- secondary: an alternative to the main action.
- tertiary: a quiet action, such as Cancel.

## Accessibility

A native button element: Tab reaches it, Enter and Space press it.
`;

/** The Button's machine-readable contract, the schema tab of the agents dialog. */
export const BUTTON_SCHEMA = `{
  "$schema": "https://halyard.example/schema/component.schema.json",
  "name": "Button",
  "import": "halyard-ui",
  "props": {
    "variant": { "type": "'primary' | 'secondary' | 'tertiary'", "default": "'primary'", "description": "How much the button stands out." },
    "size": { "type": "'default' | 'compact'", "default": "'default'", "description": "The control height." },
    "onClick": { "type": "(event: MouseEvent) => void", "description": "Runs when the button is pressed." },
    "disabled": { "type": "boolean", "default": "false", "description": "Holds the button still." },
    "loading": { "type": "boolean", "default": "false", "description": "Shows a spinner and holds the button still while an action runs." }
  },
  "keys": ["Enter", "Space"]
}`;
