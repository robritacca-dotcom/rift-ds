import MegaNav from "@/components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import Sidebar from "@/components/Sidebar/Sidebar";
import { getSidebarLinks, docsSidebarLinks } from "@/config/navigation";
import { Accordion } from "rift-ds/components/Accordion/Accordion";
import { CodeBlock } from "rift-ds/components/CodeBlock/CodeBlock";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import { Table } from "rift-ds/components/Table/Table";
import { PACKAGE_NAME, SITE_URL } from "@/config/brand.generated";
import s from "./page.module.css";

const { sidebarLinks } = getSidebarLinks(docsSidebarLinks, "/docs/schemas");

/* The schemas page, a short reference: where each published file is, the
   tokens' two forms. Every URL derives from SITE_URL; every count lives in the files themselves. */

const SCHEMA_URLS = [
  { what: "One component", where: `${SITE_URL}/schema/components/<slug>.json` },
  { what: "The index of every component schema", where: `${SITE_URL}/schema/components.json` },
  { what: "The meta-schema each component schema validates against", where: `${SITE_URL}/schema/component.schema.json` },
  { what: "The meta-schema the index validates against", where: `${SITE_URL}/schema/components-index.schema.json` },
  { what: "The tokens, one file per theme and mode (DTCG)", where: `${SITE_URL}/schema/tokens/<theme>.<mode>.tokens.json` },
  { what: "The tokens resolved per theme, in the package", where: `${PACKAGE_NAME}/tokens/values` },
  { what: "The meta-schema the token values validate against", where: `${SITE_URL}/schema/token-values.schema.json` },
];

const PROP_FIELDS = [
  { field: "name", what: "The prop name. Native attributes pass through every component and are not listed; only the component's own props are." },
  { field: "type", what: "The resolved TypeScript type as text, literal unions expanded." },
  { field: "typeKind", what: "The shape of the type, so a reader can branch without parsing TypeScript: enum, primitive, array, function, reference or other." },
  { field: "values", what: "The members of a literal union, present exactly when typeKind is enum. A prop typed through a named alias gets its members here too." },
  { field: "required", what: "Whether the prop must be passed." },
  { field: "description", what: "The prop's JSDoc description, present on every own prop by build rule." },
  { field: "default", what: "The default as a value: a number, a boolean, null, an enum member, or a string on a prop typed as a plain string." },
  { field: "defaultExpression", what: "Any other default as source text: a function, a computed number, a reference to another prop, or a string on a prop with a wider type." },
  { field: "deprecated", what: "Set when the prop carries a deprecation: the replacement guidance. The prop still works, because the published API only grows." },
];

const FETCH_SNIPPET = `curl ${SITE_URL}/schema/components/button.json | jq '.exports[0].props[] | {name, typeKind, values, default}'`;

const VALUES_SNIPPET = `import { tokenValue, THEME_IDS } from '${PACKAGE_NAME}/tokens/values';

tokenValue('--color-action-primary-bg', THEME_IDS[0], 'dark');`;

export default function SchemasPage() {
  return (
    <>
      <MegaNav />

      <div className={s.dsLayout}>
        <Sidebar links={sidebarLinks} />

        <main className={s.dsContent} id="main-content">
          <PageBreadcrumb />

          <div className={`${s.pageHeader} animate-in`}>
            <h1 className={s.pageTitle}>Schemas</h1>
          </div>

          <div className={`${s.introSection} animate-in animate-delay-1`}>
            <p className={s.subDisplay}>Every component and token as a file a program can read</p>
            <p className={s.introBody}>
              Generated on every build, so they always match what the package ships. For one
              component, use the For agents button on its page.
            </p>
          </div>

          <section id="where" className={`${s.section} animate-in animate-delay-2`}>
            <SectionTitle title="Where they are" />
            <Table
              bordered
              size="compact"
              caption="Where each schema lives"
              captionHidden
              columns={[
                { key: "what", header: "What", width: "40%" },
                { key: "where", header: "Where" },
              ]}
              rows={SCHEMA_URLS.map((row) => ({
                id: row.what,
                cells: { what: row.what, where: <code className={s.defKey}>{row.where}</code> },
              }))}
            />
            <CodeBlock code={FETCH_SNIPPET} language="bash" showCopy />
            <Accordion
              items={[
                {
                  id: "prop-fields",
                  title: "What a prop holds in a component schema",
                  content: (
                    <Table
                      bordered
                      size="compact"
                      caption="The fields of a prop in a component schema"
                      captionHidden
                      columns={[
                        { key: "field", header: "Field", width: "28%" },
                        { key: "what", header: "What it holds" },
                      ]}
                      rows={PROP_FIELDS.map((row) => ({
                        id: row.field,
                        cells: { field: <code className={s.defKey}>{row.field}</code>, what: row.what },
                      }))}
                    />
                  ),
                },
              ]}
            />
          </section>

          <section id="design-tokens" className={`${s.section} animate-in animate-delay-3`}>
            <SectionTitle title="Design tokens" />
            <p className={s.sectionNote}>
              In code, <code>{PACKAGE_NAME}/tokens/values</code> gives every token&apos;s value for
              every theme in light and dark.
            </p>
            <CodeBlock code={VALUES_SNIPPET} language="ts" showCopy />
            <p className={s.sectionNote}>
              For design tools such as Figma, Style Dictionary or Tokens Studio, the same tokens are
              DTCG files under <code>/schema/tokens/</code>, one per theme and mode, with semantic
              tokens kept as aliases of their primitives.
            </p>
          </section>
        </main>
      </div>
    </>
  );
}
