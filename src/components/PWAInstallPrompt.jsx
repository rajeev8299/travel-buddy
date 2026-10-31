import { memo, useEffect } from "react";
import { Download, X, HelpCircle, Smartphone, Share, MoreVertical, PlusSquare } from "lucide-react";
import "./PWAInstallPrompt.css";

export const PWAInstallPrompt = memo(function PWAInstallPrompt({
  canPrompt,
  platform,
  showManualModal,
  onInstall,
  onDismiss,
  onOpenManual,
  onCloseManual,
}) {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (!showManualModal) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onCloseManual();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [showManualModal, onCloseManual]);

  return (
    <>
      {/* Floating Bottom Install Banner */}
      {canPrompt && (
        <aside
          className="pwa-banner"
          role="region"
          aria-label="App Installation"
          aria-live="polite"
        >
          <div className="pwa-banner__shell">
            <div className="pwa-banner__icon-wrap">
              <img
                src="./icon-192.png"
                alt="TravelOnBuddy App Icon"
                className="pwa-banner__icon"
                width="48"
                height="48"
                onError={(e) => {
                  e.target.src = "./logo.png";
                }}
              />
            </div>

            <div className="pwa-banner__info">
              <div className="pwa-banner__title-row">
                <span className="pwa-banner__badge">Fast &amp; Offline Ready</span>
                <strong className="pwa-banner__name">TravelOnBuddy App</strong>
              </div>
              <p className="pwa-banner__desc">
                Install on your home screen for quick 1-tap access and trip plans anytime.
              </p>
            </div>

            <div className="pwa-banner__actions">
              <button
                type="button"
                className="pwa-btn pwa-btn--primary"
                onClick={onInstall}
                aria-label="Install TravelOnBuddy to home screen"
              >
                <Download size={16} strokeWidth={2.4} aria-hidden="true" />
                <span>Install</span>
              </button>

              <button
                type="button"
                className="pwa-btn pwa-btn--text"
                onClick={onDismiss}
                aria-label="Not now, dismiss installation prompt"
              >
                Not now
              </button>

              <button
                type="button"
                className="pwa-banner__help-btn"
                onClick={onOpenManual}
                title="Installation instructions"
                aria-label="How to install guide"
              >
                <HelpCircle size={18} strokeWidth={2} aria-hidden="true" />
              </button>

              <button
                type="button"
                className="pwa-banner__close-btn"
                onClick={onDismiss}
                title="Close"
                aria-label="Close installation banner"
              >
                <X size={18} strokeWidth={2} aria-hidden="true" />
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Manual Installation Guide Modal */}
      {showManualModal && (
        <div className="pwa-modal-backdrop" onClick={onCloseManual} role="dialog" aria-modal="true" aria-labelledby="pwa-modal-title">
          <div className="pwa-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="pwa-modal-header">
              <div className="pwa-modal-title-group">
                <Smartphone className="pwa-modal-icon" size={24} aria-hidden="true" />
                <h3 id="pwa-modal-title">Install TravelOnBuddy</h3>
              </div>
              <button
                type="button"
                className="pwa-modal-close"
                onClick={onCloseManual}
                aria-label="Close modal"
              >
                <X size={20} strokeWidth={2} />
              </button>
            </div>

            <div className="pwa-modal-body">
              <p className="pwa-modal-intro">
                Adding TravelOnBuddy to your device gives you instant full-screen access, smoother browsing, and offline access to your saved routes without taking up phone storage.
              </p>

              {platform.isIOS ? (
                /* iOS Safari instructions */
                <ol className="pwa-steps">
                  <li className="pwa-step">
                    <span className="pwa-step__num">1</span>
                    <div className="pwa-step__content">
                      <p>Tap the <strong>Share</strong> button at the bottom of Safari.</p>
                      <span className="pwa-step__pill"><Share size={14} /> Share</span>
                    </div>
                  </li>
                  <li className="pwa-step">
                    <span className="pwa-step__num">2</span>
                    <div className="pwa-step__content">
                      <p>Scroll down and select <strong>Add to Home Screen</strong>.</p>
                      <span className="pwa-step__pill"><PlusSquare size={14} /> Add to Home Screen</span>
                    </div>
                  </li>
                  <li className="pwa-step">
                    <span className="pwa-step__num">3</span>
                    <div className="pwa-step__content">
                      <p>Tap <strong>Add</strong> in the top-right corner to complete.</p>
                    </div>
                  </li>
                </ol>
              ) : (
                /* Android Chrome & other browsers instructions */
                <ol className="pwa-steps">
                  <li className="pwa-step">
                    <span className="pwa-step__num">1</span>
                    <div className="pwa-step__content">
                      <p>Tap the <strong>three dots</strong> menu in the browser toolbar.</p>
                      <span className="pwa-step__pill"><MoreVertical size={14} /> Menu</span>
                    </div>
                  </li>
                  <li className="pwa-step">
                    <span className="pwa-step__num">2</span>
                    <div className="pwa-step__content">
                      <p>Tap <strong>Install app</strong> or <strong>Add to Home screen</strong>.</p>
                      <span className="pwa-step__pill"><Download size={14} /> Install app</span>
                    </div>
                  </li>
                  <li className="pwa-step">
                    <span className="pwa-step__num">3</span>
                    <div className="pwa-step__content">
                      <p>Confirm by tapping <strong>Install</strong>. The TravelOnBuddy icon will appear on your home screen.</p>
                    </div>
                  </li>
                </ol>
              )}

              <div className="pwa-modal-perks">
                <div className="pwa-perk">
                  <strong>⚡ Instant Launch</strong>
                  <span>Opens without address bars or distractions.</span>
                </div>
                <div className="pwa-perk">
                  <strong>📶 Works Offline</strong>
                  <span>Essential pages remain accessible even in poor connectivity.</span>
                </div>
              </div>
            </div>

            <div className="pwa-modal-footer">
              <button
                type="button"
                className="pwa-btn pwa-btn--primary"
                onClick={onCloseManual}
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
});
