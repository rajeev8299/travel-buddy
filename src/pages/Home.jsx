import { memo } from "react";
import { useOutletContext } from "react-router-dom";
import { KashiThemeFullWidth } from "../components/KashiThemeFullWidth";

export default memo(function Home() {
  const context = useOutletContext();
  return <KashiThemeFullWidth openManualGuide={context?.openManualGuide} />;
});
