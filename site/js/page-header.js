// The banner every inner page opens with. Reads its content from data-*
// attributes on a <div id="page-header-slot"> placeholder, so each HTML page
// only has to state its own copy — the markup and image-fallback behaviour
// live here once.

function initPageHeader() {
  const slot = document.getElementById("page-header-slot");
  if (!slot) return;

  const { eyebrow, title, intro, image, pos } = slot.dataset;

  slot.outerHTML = `
    <header class="pagehead">
      <div class="pagehead__bg" id="pagehead-bg" aria-hidden="true">
        <img src="${image}" alt="" style="object-position:${pos || "center 45%"}" fetchpriority="high" />
      </div>
      <div class="pagehead__scrim" aria-hidden="true"></div>

      <div class="shell pagehead__inner">
        ${eyebrow ? `<p class="eyebrow">${eyebrow}</p>` : ""}
        <h1>${title}</h1>
        ${intro ? `<p class="pagehead__intro">${intro}</p>` : ""}
      </div>
    </header>`;

  const bg = document.getElementById("pagehead-bg");
  bg.querySelector("img").addEventListener(
    "error",
    () => {
      bg.innerHTML = GHATS_PANORAMA_SVG;
    },
    { once: true },
  );
}

document.addEventListener("DOMContentLoaded", initPageHeader);
