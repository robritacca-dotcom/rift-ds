/**
 * Labs: raceway-chat, the chat-first construction platform screen
 * (RacewayChatHome.tsx owns the composition). Noindex and chromeless like
 * every lab.
 */

import RacewayChatHome from "./RacewayChatHome";

export default function RacewayChatPage() {
  return (
    <>
      <h1 className="ds-visually-hidden">Riser</h1>
      <RacewayChatHome />
    </>
  );
}
