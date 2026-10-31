// PWA Service Worker Registration and Install Experience for docs/ (Vanilla JS site)
(function () {
  "use strict";

  const DISMISSAL_KEY = "tob_pwa_dismissed_until";
  const INSTALLED_KEY = "tob_pwa_installed";
  const COOLDOWN_DAYS = 7;

  // 1. Service Worker Registration (HTTP/HTTPS only)
  if ("serviceWorker" in navigator && window.location.protocol.startsWith("http")) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("./sw.js")
        .then((reg) => {
          reg.onupdatefound = () => {
            const worker = reg.installing;
            if (worker) {
              worker.onstatechange = () => {
                if (worker.state === "installed" && navigator.serviceWorker.controller) {
                  console.info("[PWA] Update ready. Reload to update.");
                }
              };
            }
          };
        })
        .catch((err) => {
          console.warn("[PWA] Service worker registration error:", err);
        });
    });
  }

  // 2. Standalone Detection
  function isStandalone() {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.matchMedia("(display-mode: fullscreen)").matches ||
      window.matchMedia("(display-mode: minimal-ui)").matches ||
      window.navigator.standalone === true
    );
  }

  if (isStandalone()) {
    try {
      localStorage.setItem(INSTALLED_KEY, "true");
    } catch {}
    return; // Don't show installation promotion inside standalone app
  }

  // 3. Check dismissals or existing install
  try {
    const installed = localStorage.getItem(INSTALLED_KEY);
    if (installed === "true") return;

    const dismissedUntil = localStorage.getItem(DISMISSAL_KEY);
    if (dismissedUntil && Date.now() < parseInt(dismissedUntil, 10)) {
      return;
    }
  } catch {}

  let deferredPrompt = null;
  const isAndroid = /Android/i.test(navigator.userAgent || "");
  const isMobile = /iPhone|iPad|iPod|Android|Mobile/i.test(navigator.userAgent || "");

  // 4. Capture native install prompt
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    try {
      localStorage.setItem(INSTALLED_KEY, "true");
    } catch {}
    const banner = document.getElementById("pwa-install-banner");
    if (banner) banner.remove();
  });

  // 5. Mount Banner after slight delay
  setTimeout(() => {
    // If not mobile/Android and no prompt, avoid annoying desktop visitors
    if (!deferredPrompt && !isAndroid && !isMobile) return;

    if (document.getElementById("pwa-install-banner")) return;

    const banner = document.createElement("aside");
    banner.id = "pwa-install-banner";
    banner.className = "pwa-banner";
    banner.setAttribute("role", "region");
    banner.setAttribute("aria-label", "App Installation");

    banner.innerHTML = `
      <div class="pwa-banner__shell">
        <div class="pwa-banner__icon-wrap">
          <img src="icon-192.png" alt="TravelOnBuddy" class="pwa-banner__icon" width="48" height="48" onerror="this.src='logo.png'">
        </div>
        <div class="pwa-banner__info">
          <div class="pwa-banner__title-row">
            <span class="pwa-banner__badge">Fast &amp; Offline Ready</span>
            <strong class="pwa-banner__name">TravelOnBuddy App</strong>
          </div>
          <p class="pwa-banner__desc">Install on your home screen for quick 1-tap access and trip plans anytime.</p>
        </div>
        <div class="pwa-banner__actions">
          <button type="button" class="pwa-btn pwa-btn--primary" id="pwa-install-btn">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            <span>Install</span>
          </button>
          <button type="button" class="pwa-btn pwa-btn--text" id="pwa-dismiss-btn">Not now</button>
        </div>
      </div>
    `;

    document.body.appendChild(banner);

    const installBtn = document.getElementById("pwa-install-btn");
    const dismissBtn = document.getElementById("pwa-dismiss-btn");

    function dismiss() {
      banner.remove();
      try {
        const expiry = Date.now() + COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
        localStorage.setItem(DISMISSAL_KEY, expiry.toString());
      } catch {}
    }

    if (dismissBtn) dismissBtn.addEventListener("click", dismiss);

    if (installBtn) {
      installBtn.addEventListener("click", async () => {
        if (deferredPrompt) {
          try {
            deferredPrompt.prompt();
            const choice = await deferredPrompt.userChoice;
            if (choice.outcome === "accepted") {
              try {
                localStorage.setItem(INSTALLED_KEY, "true");
              } catch {}
              banner.remove();
            } else {
              dismiss();
            }
          } catch (err) {
            console.warn("[PWA] Prompt error:", err);
          } finally {
            deferredPrompt = null;
          }
        } else {
          // Manual fallback guidance
          alert("To install TravelOnBuddy on your device:\n\n1. Tap your browser's menu (three dots or Share button)\n2. Select 'Install app' or 'Add to Home screen'\n3. Confirm to launch full-screen from your home screen.");
          dismiss();
        }
      });
    }
  }, 2500);
})();

