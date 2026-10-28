import styles from "./PhoneKeyboard.module.css";

/* ============================================
   The soft keyboard the site's phone previews raise: the home page's chat
   frame in its mobile mode, and the playground's mobile bezel. Set
   dressing, hidden from assistive tech: three rows of letters, the shift
   and delete keys, and the bottom row, in iOS's layout.

   It sits in the phone's screen column below the app and is closed to no
   height; `data-open` on its root raises it, taking that height from the
   app above it. Each letter key and the space bar carry `data-key`, and
   `data-pressed` on a key lights it, so a host can show what is typed.
   A host either passes `open`, or leaves it unset and writes the
   attributes itself, as the home page's reel does frame by frame.
   ============================================ */

const KEY_ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];

/** The key for a typed character, or null when it has none on the letter
    layer (digits and punctuation). */
export function findKey(root: ParentNode, char: string): Element | null {
  return root.querySelector(`[data-key="${CSS.escape(char.toLowerCase())}"]`);
}

export default function PhoneKeyboard({ open }: { open?: boolean }) {
  return (
    <div className={styles.keyboard} data-keyboard data-open={open || undefined} aria-hidden="true">
      <div className={styles.keyboardInner}>
        <div className={styles.keys}>
          {KEY_ROWS.map((row, i) => (
            <div key={row} className={styles.keyRow}>
              {i === 2 && (
                <span className={`${styles.key} ${styles.keyWide}`}>
                  <span className="material-symbols-rounded">shift</span>
                </span>
              )}
              {[...row].map((letter) => (
                <span key={letter} className={styles.key} data-key={letter}>
                  {letter}
                </span>
              ))}
              {i === 2 && (
                <span className={`${styles.key} ${styles.keyWide}`}>
                  <span className="material-symbols-rounded">backspace</span>
                </span>
              )}
            </div>
          ))}
          <div className={styles.keyRow}>
            <span className={`${styles.key} ${styles.keyWide}`}>123</span>
            <span className={`${styles.key} ${styles.keySpace}`} data-key=" ">space</span>
            <span className={`${styles.key} ${styles.keyWide}`}>return</span>
          </div>
        </div>
      </div>
    </div>
  );
}
