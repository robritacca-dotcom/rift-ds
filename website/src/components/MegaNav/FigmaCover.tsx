import { Button } from "rift-ds/components/Button/Button";
import k from "@/app/docs/figma/KitWindow.module.css";
import s from "./FigmaCover.module.css";

const VARIANTS = ["primary", "secondary", "tertiary"] as const;
const SIZES = ["default", "compact"] as const;

const CURSORS = [
  { name: "Designer", className: k.cursorDesigner },
  { name: "Engineer", className: k.cursorEngineer },
  { name: "Agent", className: k.cursorAgent },
];

/**
 * The Docs showcase's cover: the Figma kit's canvas at card size, a
 * selected Button component set with collaborators' cursors moving over
 * it. It borrows the /docs/figma window's Figma palette, selection and
 * cursors (KitWindow.module.css), so the two pictures never drift. The
 * Buttons wear the site's theme. Inert and decorative; the card's copy
 * carries the meaning.
 */
export function FigmaCover() {
  return (
    <div className={`${k.palette} ${s.canvas}`} aria-hidden="true" inert>
      <div className={s.stage}>
        <div className={`${k.selection} ${s.selection}`}>
          <span className={k.selectionName}>
            <svg viewBox="0 0 16 16" className={k.glyph} aria-hidden="true">
              <path d="M8 1.8 10.1 3.9 8 6 5.9 3.9Z M3.9 5.9 6 8 3.9 10.1 1.8 8Z M12.1 5.9 14.2 8 12.1 10.1 10 8Z M8 10 10.1 12.1 8 14.2 5.9 12.1Z" />
            </svg>
            Button
          </span>
          <div className={`${k.set} ${s.set}`}>
            {VARIANTS.map((variant) =>
              SIZES.map((size) => (
                <Button key={`${variant}-${size}`} label="Button" variant={variant} size={size} tabIndex={-1} />
              ))
            )}
          </div>
          <span className={`${k.handle} ${k.handleTl}`} />
          <span className={`${k.handle} ${k.handleTr}`} />
          <span className={`${k.handle} ${k.handleBl}`} />
          <span className={`${k.handle} ${k.handleBr}`} />
        </div>
      </div>
      {CURSORS.map((cursor) => (
        <span key={cursor.name} className={`${k.cursor} ${cursor.className}`}>
          <svg viewBox="0 0 16 16" className={k.cursorArrow}>
            <path d="M2 1.5v12.2l3.3-3.1 2.4 4.6 2-1-2.4-4.5 4.6-.3Z" />
          </svg>
          <span className={k.cursorName}>{cursor.name}</span>
        </span>
      ))}
    </div>
  );
}
