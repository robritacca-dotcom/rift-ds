import Link from "next/link";
import Image from "next/image";
import MegaNav from "../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import Sidebar from "../../components/Sidebar/Sidebar";
import GitHubContributions from "../../components/GitHubContributions/GitHubContributions";
import { Timeline } from "@robr0/design-system/components/Timeline/Timeline";
import { getSidebarLinks, docsSidebarLinks } from "@/config/navigation";
import { siteUpdates, siteUpdatesAsOf, SITE_UPDATE_COUNT } from "@/data/site-updates";
import styles from "./page.module.css";
import { BRAND_NAME, REPOSITORY_URL, STORYBOOK_URL } from "@/config/brand.generated";

const { sidebarLinks } = getSidebarLinks(docsSidebarLinks, "/project-journal");

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function SiteUpdatesPage() {
  const items = siteUpdates.map((entry) => ({
    meta: entry.meta,
    title: entry.title,
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

  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <Sidebar links={sidebarLinks} />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Project journal</h1>
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>The progression of the build</p>
            <p className={styles.introBody}>
              An evergreen record of the largest updates to {BRAND_NAME} and this
              site. Each entry consolidates the commits behind one theme into a
              short record of what was built and when. Curated from the full
              history and extended on a biweekly loop.
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
                <h2 className={styles.timelineSectionTitle}>Timeline</h2>
              </div>
              <Timeline items={items} orientation="vertical" />
            </div>

            <aside className={styles.updatesRail} aria-label="Project journal details">
              <div className={styles.railSection}>
                <div className={styles.railSectionHeader}>
                  <h2 className={styles.railSectionTitle}>Details</h2>
                </div>
                <div className={styles.detailList}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Entries</span>
                    <span className={styles.detailValue}>{SITE_UPDATE_COUNT}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>History since</span>
                    <span className={styles.detailValue}>February 13, 2026</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Last curated</span>
                    <span className={styles.detailValue}>{formatDate(siteUpdatesAsOf.date)}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Cadence</span>
                    <span className={styles.detailValue}>Biweekly, 1st &amp; 15th</span>
                  </div>
                </div>
              </div>

              <div className={styles.railSection}>
                <div className={styles.railSectionHeader}>
                  <h2 className={styles.railSectionTitle}>Links</h2>
                </div>
                <div className={styles.linkList}>
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
                      <span className={styles.linkSub}>Every commit behind these stories</span>
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

                  <Link href="/loops" className={styles.linkItem}>
                    <Image src="/logos/mark.svg" alt="" width={28} height={28} className={styles.linkLogo} />
                    <div className={styles.linkContent}>
                      <div className={styles.linkTitle}>
                        <span>Loops</span>
                        <span className="material-symbols-rounded" aria-hidden="true">arrow_forward</span>
                      </div>
                      <span className={styles.linkSub}>The loop that keeps this page current</span>
                    </div>
                  </Link>

                  <Link href="/overview" className={styles.linkItem}>
                    <Image src="/logos/mark.svg" alt="" width={28} height={28} className={styles.linkLogo} />
                    <div className={styles.linkContent}>
                      <div className={styles.linkTitle}>
                        <span>System overview</span>
                        <span className="material-symbols-rounded" aria-hidden="true">arrow_forward</span>
                      </div>
                      <span className={styles.linkSub}>How the system is built and shipped</span>
                    </div>
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>

    </>
  );
}
