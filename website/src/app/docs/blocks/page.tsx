import Link from "next/link";
import MegaNav from "@/components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import Sidebar from "@/components/Sidebar/Sidebar";
import { getSidebarLinks, docsSidebarLinks } from "@/config/navigation";
import { CodeBlock } from "rift-ds/components/CodeBlock/CodeBlock";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import { PACKAGE_NAME } from "@/config/brand.generated";
import { blockPreviewPath, blocks } from "@/data/blocks";
import { BlockPreview } from "./BlockPreview";
import s from "./page.module.css";

const { sidebarLinks } = getSidebarLinks(docsSidebarLinks, "/docs/blocks");

/* The blocks index: how to add one, then every block from the registry
   (src/cli/templates/blocks/registry.json) with a live preview of its
   route at a desktop, tablet or phone width, its command and its files.
   The preview loads the block's own source. */

const SETUP_SNIPPET = `npm install ${PACKAGE_NAME}
npx ${PACKAGE_NAME} init app`;

export default function BlocksPage() {
  return (
    <>
      <MegaNav />

      <div className={s.dsLayout}>
        <Sidebar links={sidebarLinks} />

        <main className={s.dsContent} id="main-content">
          <PageBreadcrumb />

          <div className={`${s.pageHeader} animate-in`}>
            <h1 className={s.pageTitle}>Blocks</h1>
          </div>

          <div className={`${s.introSection} animate-in animate-delay-1`}>
            <p className={s.subDisplay}>Starting pages with the layout already done</p>
            <p className={s.introBody}>
              A block is a whole page for a new app: the navigation, the header and the spacing set,
              built from the components and tokens alone, and laid out for a phone as well as a
              desktop. One command copies its files into your app. From then on they are yours to
              change, so a block never updates under you, and a file you already have is never
              overwritten.
            </p>
          </div>

          <section id="add-a-block" className={`${s.section} animate-in animate-delay-2`}>
            <SectionTitle title="Add a block" />
            <p className={s.sectionNote}>
              Blocks are for a Next.js app router project. Set the app up for the library first, if
              you have not, so links route through Next and the colour mode holds:
            </p>
            <CodeBlock code={SETUP_SNIPPET} language="bash" showCopy />
            <p className={s.sectionNote}>
              Then add a block by name. Run <code>npx {PACKAGE_NAME} init block</code> on its own to
              list them. The app shell and the dashboard share one shell file, which the first of
              them writes; see <Link href="/docs/get-started" className={s.inlineLink}>Get started</Link>{" "}
              for the tokens and theming the blocks read.
            </p>
          </section>

          {blocks.map((block) => (
            <section key={block.name} id={block.name} className={s.section}>
              <SectionTitle title={block.label} />
              <p className={s.sectionNote}>{block.description}</p>
              <BlockPreview src={blockPreviewPath(block.name)} title={block.label} />
              <p className={s.sectionNote}>
                <Link href={blockPreviewPath(block.name)} className={s.inlineLink}>
                  Open it full screen
                </Link>
                . Add it with:
              </p>
              <CodeBlock code={`npx ${PACKAGE_NAME} init block ${block.name}`} language="bash" showCopy />
              <p className={s.sectionNote}>
                What it writes, the page landing at <code>{block.route}</code>:
              </p>
              <CodeBlock code={block.files.join("\n")} language="text" />
            </section>
          ))}
        </main>
      </div>
    </>
  );
}
