"use client";

import MegaNav from "@/components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import Sidebar from "@/components/Sidebar/Sidebar";
import TocCard from "@/components/TocCard/TocCard";
import PageLinks from "@/components/PageLinks/PageLinks";
import { getSidebarLinks, chatSidebarLinks } from "@/config/navigation";
import s from "./section.module.css";

const { sidebarLinks } = getSidebarLinks(chatSidebarLinks, "/chat");

/* The Chat index, in the house format: a title, a short intro and one card
   per page in the section. The cards are the sidebar's links, minus the
   Contents entry, so a page added to chatSidebarLinks gets a card here. */
const CARD_ICONS: Record<string, string> = {
  "/chat/overview": "forum",
  "/chat/install": "download",
};

const cards = chatSidebarLinks.filter((link) => link.href !== "/chat");

export default function ChatIndexPage() {
  return (
    <>
      <MegaNav />

      <div className={s.dsLayout}>
        <Sidebar links={sidebarLinks} />

        <main className={s.dsContent} id="main-content">
          <PageBreadcrumb />

          <div className={`${s.pageHeader} animate-in`}>
            <h1 className={s.pageTitle}>Chat</h1>
            <PageLinks storybookPath="/?path=/docs/chat-chatwidget--docs" />
          </div>

          <div className={`${s.introSection} animate-in animate-delay-1`}>
            <p className={s.subDisplay}>An AI chat for your app. Added in minutes.</p>
            <p className={s.introBody}>
              Everything a good chat needs is already built: the panel, the replies, the history, the
              cards a reply can carry, and the server behind it. Start with the overview to see it
              working, then open Install and pick how much of it you want: all of it with one command,
              the panel over your own endpoint, or the engine under your own design.
            </p>
          </div>

          <div className={`${s.tocGrid} animate-in animate-delay-2`}>
            {cards.map((card) => (
              <TocCard key={card.href} href={card.href} title={card.label}>
                <div className={s.circlePreview}>
                  <span className="material-symbols-rounded" aria-hidden="true">
                    {CARD_ICONS[card.href] ?? "description"}
                  </span>
                </div>
              </TocCard>
            ))}
          </div>
        </main>
      </div>
    </>
  );
}
