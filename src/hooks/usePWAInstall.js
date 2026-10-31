import { useState, useEffect, useCallback, useRef } from "react";

const DISMISSAL_KEY = "tob_pwa_dismissed_until";
const INSTALLED_KEY = "tob_pwa_installed";
const DEFAULT_COOLDOWN_DAYS = 7;

/**
 * Checks if running in standalone display mode (installed PWA)
 */
export function isRunningStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    window.matchMedia("(display-mode: minimal-ui)").matches ||
    window.navigator.standalone === true
  );
}

/**
 * Detect client platform characteristics
 */
export function getClientPlatform() {
  if (typeof window === "undefined") {
    return { isAndroid: false, isIOS: false, isMobile: false, isSupportedBrowser: false };
  }
  const ua = window.navigator.userAgent || "";
  const isAndroid = /Android/i.test(ua);
  const isIOS = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isMobile = isAndroid || isIOS || /Mobile/i.test(ua);
  const isChrome = /Chrome/i.test(ua) && !/Edge|Edg|OPR/i.test(ua);
  const isSamsung = /SamsungBrowser/i.test(ua);

  return {
    isAndroid,
    isIOS,
    isMobile,
    isChrome,
    isSamsung,
    isSupportedBrowser: isAndroid || isChrome || isSamsung,
  };
}

export function usePWAInstall({ cooldownDays = DEFAULT_COOLDOWN_DAYS, initialDelayMs = 2500 } = {}) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isInstalledConfirmed, setIsInstalledConfirmed] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [readyToShow, setReadyToShow] = useState(false);
  const [platform, setPlatform] = useState({ isAndroid: false, isIOS: false, isMobile: false });

  const timerRef = useRef(null);

  // Initialize checks on mount
  useEffect(() => {
    const standalone = isRunningStandalone();
    setIsStandalone(standalone);
    setPlatform(getClientPlatform());

    // Check localStorage for dismissal or verified install
    try {
      const dismissedUntil = localStorage.getItem(DISMISSAL_KEY);
      if (dismissedUntil && Date.now() < parseInt(dismissedUntil, 10)) {
        setIsDismissed(true);
      }
      const installedFlag = localStorage.getItem(INSTALLED_KEY);
      if (installedFlag === "true" || standalone) {
        setIsInstalledConfirmed(true);
      }
    } catch {
      // Storage access blocked or restricted
    }

    // Delay prompt appearance so visitor has time to see the page first
    timerRef.current = setTimeout(() => {
      setReadyToShow(true);
    }, initialDelayMs);

    // Listen for beforeinstallprompt event (Chromium / Android)
    const handleBeforeInstallPrompt = (e) => {
      // Prevent automatic browser mini-infobar on mobile
      e.preventDefault();
      setDeferredPrompt(e);
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstalledConfirmed(true);
      try {
        localStorage.setItem(INSTALLED_KEY, "true");
        localStorage.removeItem(DISMISSAL_KEY);
      } catch {
        // Storage access blocked
      }
    };

    // Watch for standalone display mode changes
    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    const handleDisplayModeChange = (e) => {
      if (e.matches) {
        setIsStandalone(true);
        setIsInstalledConfirmed(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleDisplayModeChange);
    } else {
      mediaQuery.addListener(handleDisplayModeChange);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleDisplayModeChange);
      } else {
        mediaQuery.removeListener(handleDisplayModeChange);
      }
    };
  }, [initialDelayMs]);

  // Dismiss prompt and set cooldown
  const dismissPrompt = useCallback(() => {
    setIsDismissed(true);
    try {
      const expiry = Date.now() + cooldownDays * 24 * 60 * 60 * 1000;
      localStorage.setItem(DISMISSAL_KEY, expiry.toString());
    } catch {
      // Storage access blocked
    }
  }, [cooldownDays]);

  // Trigger installation
  const triggerInstall = useCallback(async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult.outcome === "accepted") {
          setIsInstalledConfirmed(true);
          try {
            localStorage.setItem(INSTALLED_KEY, "true");
          } catch {
            // Ignore
          }
        } else {
          dismissPrompt();
        }
      } catch (err) {
        console.warn("[PWA] Prompt error:", err);
      } finally {
        setDeferredPrompt(null);
      }
    } else {
      // If native prompt is not available, open manual guide
      setShowManualModal(true);
    }
  }, [deferredPrompt, dismissPrompt]);

  const openManualGuide = useCallback(() => {
    setShowManualModal(true);
  }, []);

  const closeManualGuide = useCallback(() => {
    setShowManualModal(false);
  }, []);

  // Determine if banner should be displayed
  const canPrompt = Boolean(
    readyToShow &&
      !isStandalone &&
      !isInstalledConfirmed &&
      !isDismissed &&
      (deferredPrompt || platform.isAndroid || platform.isMobile)
  );

  return {
    canPrompt,
    isStandalone,
    isInstalledConfirmed,
    isDismissed,
    hasDeferredPrompt: Boolean(deferredPrompt),
    platform,
    showManualModal,
    triggerInstall,
    dismissPrompt,
    openManualGuide,
    closeManualGuide,
  };
}

