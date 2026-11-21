import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";
import ButtonDocs from "../../../../components/button/ButtonDocs";

/** The Button page's article and install strip, unchanged, inside SiteLayout. */
export default function LabsSiteFrameButton() {
  return (
    <>
      <ButtonDocs />
      <ComponentInstallStrip slug="button" />
    </>
  );
}
