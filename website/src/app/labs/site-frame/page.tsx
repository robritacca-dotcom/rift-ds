import DesignSystemLanding from "../../DesignSystemLanding";

/** The home page, with the site's own header and main turned off: SiteLayout brings both. */
export default function LabsSiteFrameHome() {
  return <DesignSystemLanding chrome={false} />;
}
