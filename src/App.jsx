import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { usePWAInstall } from "./hooks/usePWAInstall";
import { PWAInstallPrompt } from "./components/PWAInstallPrompt";
import { KashiHeader } from "./components/KashiHeader";
import { KashiFooter } from "./components/KashiFooter";
import "./App.css";

/** Every navigation should land at the top of the new page, not mid-scroll. */
function useScrollToTop(pathname) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
}

export default function App() {
  const { pathname } = useLocation();

  useScrollToTop(pathname);

  const {
    canPrompt,
    platform,
    showManualModal,
    triggerInstall,
    dismissPrompt,
    openManualGuide,
    closeManualGuide,
  } = usePWAInstall();

  return (
    <div className="page">
      {/* Exactly ONE global header across all public routes: Dark Kashi Navy Header */}
      <KashiHeader />

      <main>
        <Outlet context={{ openManualGuide }} />
      </main>

      {/* Exactly ONE global footer across all public routes: Dark Kashi Navy Footer */}
      <KashiFooter openManualGuide={openManualGuide} />

      {/* Progressive Web App Install Prompt & Manual Guide */}
      <PWAInstallPrompt
        canPrompt={canPrompt}
        platform={platform}
        showManualModal={showManualModal}
        onInstall={triggerInstall}
        onDismiss={dismissPrompt}
        onOpenManual={openManualGuide}
        onCloseManual={closeManualGuide}
      />
    </div>
  );
}
