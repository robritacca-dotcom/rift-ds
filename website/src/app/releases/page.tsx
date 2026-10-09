import Image from "next/image";
import MegaNav from "../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import Sidebar from "../../components/Sidebar/Sidebar";
import GitHubContributions from "../../components/GitHubContributions/GitHubContributions";
import { Timeline } from "rift-ds/components/Timeline/Timeline";
import { EmptyState } from "rift-ds/components/EmptyState/EmptyState";
import { getSidebarLinks, docsSidebarLinks } from "@/config/navigation";
import {
  releases,
  latestRelease,
  RELEASE_COUNT,
  predecessorReleases,
  PREDECESSOR_RELEASE_COUNT,
} from "@/data/release-log";
import styles from "./page.module.css";
import { BRAND_NAME, NPM_URL, REPOSITORY_URL, STORYBOOK_URL } from "@/config/brand.generated";

const { sidebarLinks } = getSidebarLinks(docsSidebarLinks, "/releases");

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function ReleasesPage() {
  const items = releases.map((entry) => ({
    meta: formatDate(entry.date),
    title: `${entry.version} — ${entry.title}`,
    description: (
      <>
        {entry.body.map((paragraph, i) => (
          <p key={i} className={styles.entryParagraph}>
            {paragraph}
          </p>
        ))}
      </>
    ),
  }));

  const earlierItems = predecessorReleases.map((entry) => ({
    meta: formatDate(entry.date),
    title: entry.version,
    description: entry.summary ? (
      <p className={styles.entryParagraph}>{entry.summary}</p>
    ) : undefined,
  }));
  const firstRelease = releases[releases.length - 1];
  const firstEarlierRelease = predecessorReleases[predecessorReleases.length - 1];

  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <Sidebar links={sidebarLinks} />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Release log</h1>
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>One entry per npm release</p>
            <p className={styles.introBody}>
              What each published version of {BRAND_NAME} shipped, newest
              first. The log is one to one with npm: an entry is written when
              a version is published, and never otherwise, so this page and
              the registry always tell the same story. The versions published
              before the package was renamed are listed beneath it.
            </p>
          </div>

          {/* Contributions — real GitHub activity for this repo's account */}
          <div className={`${styles.contributionsSection} animate-in animate-delay-2`}>
            <div className={styles.contributionsHeader}>
              <h2 className={styles.contributionsTitle}>Contributions</h2>
            </div>
            <p className={styles.contributionsIntro}>
              The system is built in public: every commit lands on GitHub. This is the real activity, pulled live from the account that builds {BRAND_NAME}.
            </p>
            <GitHubContributions />
          </div>

          <div className={`${styles.updatesLayout} animate-in animate-delay-3`}>
            <div className={styles.timelineSection}>
              <div className={styles.timelineSectionHeader}>
                <h2 className={styles.timelineSectionTitle}>Releases</h2>
              </div>
              {RELEASE_COUNT === 0 ? (
                <EmptyState
                  icon="new_releases"
                  title="No releases yet"
                  description="The first entry lands with the first npm publish."
                  variant="bordered"
                />
              ) : (
                <Timeline items={items} orientation="vertical" />
              )}

              {firstRelease && firstEarlierRelease && (
                <div className={styles.earlierSection}>
                  <div className={styles.timelineSectionHeader}>
                    <h2 className={styles.timelineSectionTitle}>Before {BRAND_NAME}</h2>
                  </div>
                  <p className={styles.contributionsIntro}>
                    {BRAND_NAME} starts at {firstRelease.version}, but the system is older
                    than that. It first reached npm on {formatDate(firstEarlierRelease.date)} under
                    an earlier package name, and shipped {PREDECESSOR_RELEASE_COUNT} versions
                    there before it was renamed and restarted on {formatDate(firstRelease.date)}.
                    Those versions stayed behind on the old name. This is what each one added,
                    newest first.
                  </p>
                  <Timeline items={earlierItems} orientation="vertical" />
                </div>
              )}
            </div>

            <aside className={styles.updatesRail} aria-label="Release log details">
              <div className={styles.railSection}>
                <div className={styles.railSectionHeader}>
                  <h2 className={styles.railSectionTitle}>Details</h2>
                </div>
                <div className={styles.detailList}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Releases</span>
                    <span className={styles.detailValue}>{RELEASE_COUNT}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Before the rename</span>
                    <span className={styles.detailValue}>{PREDECESSOR_RELEASE_COUNT}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Latest</span>
                    <span className={styles.detailValue}>
                      {latestRelease ? latestRelease.version : "—"}
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Cadence</span>
                    <span className={styles.detailValue}>With every publish</span>
                  </div>
                </div>
              </div>

              <div className={styles.railSection}>
                <div className={styles.railSectionHeader}>
                  <h2 className={styles.railSectionTitle}>Links</h2>
                </div>
                <div className={styles.linkList}>
                  <a
                    href={NPM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.linkItem}
                  >
                    <Image src="/logos/npm.svg" alt="" width={28} height={28} className={styles.linkLogo} />
                    <div className={styles.linkContent}>
                      <div className={styles.linkTitle}>
                        <span>npm package</span>
                        <span className="material-symbols-rounded" aria-hidden="true">open_in_new</span>
                      </div>
                      <span className={styles.linkSub}>Every version this log records</span>
                    </div>
                  </a>

                  <a
                    href={`${REPOSITORY_URL}/commits/main`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.linkItem}
                  >
                    <Image src="/logos/Git.svg" alt="" width={28} height={28} className={styles.linkLogo} />
                    <div className={styles.linkContent}>
                      <div className={styles.linkTitle}>
                        <span>Commit history</span>
                        <span className="material-symbols-rounded" aria-hidden="true">open_in_new</span>
                      </div>
                      <span className={styles.linkSub}>Every commit behind these releases</span>
                    </div>
                  </a>

                  <a
                    href={REPOSITORY_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.linkItem}
                  >
                    <Image src="/logos/Git.svg" alt="" width={28} height={28} className={styles.linkLogo} />
                    <div className={styles.linkContent}>
                      <div className={styles.linkTitle}>
                        <span>GitHub repo</span>
                        <span className="material-symbols-rounded" aria-hidden="true">open_in_new</span>
                      </div>
                      <span className={styles.linkSub}>The whole system, public</span>
                    </div>
                  </a>

                  <a
                    href={STORYBOOK_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.linkItem}
                  >
                    <Image src="/logos/storybook.svg" alt="" width={28} height={28} className={styles.linkLogo} />
                    <div className={styles.linkContent}>
                      <div className={styles.linkTitle}>
                        <span>Storybook</span>
                        <span className="material-symbols-rounded" aria-hidden="true">open_in_new</span>
                      </div>
                      <span className={styles.linkSub}>Every component, every variant</span>
                    </div>
                  </a>
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </>
  );
}
