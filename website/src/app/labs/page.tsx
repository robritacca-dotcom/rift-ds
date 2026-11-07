/**
 * Labs: the index. Every lab under website/src/app/labs/ as a link, found
 * at build time, so a new lab appears here the moment its folder exists,
 * with nothing to register.
 *
 * A lab is a folder with a page.tsx. Its name and line come from the
 * metadata every lab already declares (`title: "Labs: …"` and
 * `description`, in its layout.tsx or its page.tsx); a lab without them is
 * listed by its folder name. Folders starting with `_` or `.` are never
 * labs. The gitignored local labs (LOCAL_LABS_PREFIX in
 * website/src/config/chromeless.ts) are listed in a group of their own when
 * they exist on disk, which is only ever on the owner's machine: CI and
 * the deployed site never have them.
 *
 * Noindex and chromeless like every lab, and excluded from the chat corpus
 * (see EXCLUDED_ROUTES in scripts/generate-site-corpus.mjs).
 */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import Link from "next/link";
import styles from "./page.module.css";

export const metadata = {
  title: "Labs",
  description: "Every labs experiment on the site, listed as it lands.",
  // Noindex by design: the labs index sits outside the IA like the labs it
  // lists: no nav, no sitemap, no corpus.
  robots: { index: false, follow: false },
};

type Lab = { href: string; name: string; description?: string };

const LABS_DIR = join(process.cwd(), "src", "app", "labs");
const LOCAL_DIR = "local";

/** Reads a string literal for `key` out of a metadata block. */
function literal(source: string, key: string) {
  const match = source.match(new RegExp(`\\b${key}:\\s*(["'])((?:(?!\\1).)*)\\1`, "s"));
  return match?.[2].replace(/\s+/g, " ").trim();
}

function readLab(dir: string, href: string, folder: string): Lab | null {
  if (!existsSync(join(dir, "page.tsx"))) return null;
  const sources = ["layout.tsx", "page.tsx"]
    .map((file) => join(dir, file))
    .filter((path) => existsSync(path))
    .map((path) => readFileSync(path, "utf8"));
  const title = sources.map((source) => literal(source, "title")).find(Boolean);
  const description = sources.map((source) => literal(source, "description")).find(Boolean);
  const raw = title?.replace(/^Labs:\s*/i, "") || folder.replace(/-/g, " ");
  /* Sentence case, as the site writes names: the titles run lower case
     after "Labs:", so only the first letter rises. */
  const name = raw.charAt(0).toUpperCase() + raw.slice(1);
  return { href, name, description };
}

function readLabs(dir: string, base: string): Lab[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !/^[_.]/.test(entry.name))
    .filter((entry) => entry.name !== LOCAL_DIR)
    .map((entry) => readLab(join(dir, entry.name), `${base}/${entry.name}`, entry.name))
    .filter((lab): lab is Lab => lab !== null)
    .sort((a, b) => a.name.localeCompare(b.name));
}

function LabList({ labs }: { labs: Lab[] }) {
  return (
    <ul className={styles.list}>
      {labs.map((lab) => (
        <li key={lab.href}>
          <Link href={lab.href} className={styles.lab}>
            <span className={styles.name}>{lab.name}</span>
            {lab.description && <span className={styles.description}>{lab.description}</span>}
            <span className={styles.path}>{lab.href}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function LabsIndexPage() {
  const labs = readLabs(LABS_DIR, "/labs");
  const local = readLabs(join(LABS_DIR, LOCAL_DIR), `/labs/${LOCAL_DIR}`);

  return (
    <main className={styles.page}>
      <header className={styles.heading}>
        <h1 className={styles.title}>Labs</h1>
        <p className={styles.subtitle}>
          Experiments in progress, built for fun. They sit outside the nav and the search
          index, and any of them can change or disappear.
        </p>
      </header>

      <section className={styles.section} aria-labelledby="labs-all">
        <h2 id="labs-all" className={styles.sectionTitle}>
          Experiments
        </h2>
        <LabList labs={labs} />
      </section>

      {local.length > 0 && (
        <section className={styles.section} aria-labelledby="labs-local">
          <h2 id="labs-local" className={styles.sectionTitle}>
            On this machine only
          </h2>
          <LabList labs={local} />
        </section>
      )}
    </main>
  );
}
