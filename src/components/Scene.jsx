import { memo } from "react";

/** Sunrise over the Varanasi ghats, drawn rather than photographed. */
export const GhatsPanorama = memo(function GhatsPanorama() {
  return (
    <svg
      viewBox="0 0 1200 440"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="Sunrise over the ghats of Varanasi, with temple spires and boats on the Ganga"
    >
      <defs>
        <linearGradient id="bt-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EF8F1F" />
          <stop offset="52%" stopColor="#F9BE71" />
          <stop offset="100%" stopColor="#FFE6BE" />
        </linearGradient>
        <linearGradient id="bt-river" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C9762A" />
          <stop offset="100%" stopColor="#7E4211" />
        </linearGradient>
        <radialGradient id="bt-glow">
          <stop offset="0%" stopColor="#FFF6E0" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#FFF6E0" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="1200" height="440" fill="url(#bt-sky)" />
      <circle cx="880" cy="188" r="170" fill="url(#bt-glow)" />
      <circle cx="880" cy="188" r="54" fill="#FFF4DA" />

      <g stroke="#7E4211" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity=".55">
        <path d="M120 92q9-8 18 0M156 78q9-8 18 0M196 100q9-8 18 0" />
        <path d="M1010 74q11-9 22 0M1058 96q11-9 22 0" />
      </g>

      <g fill="#C77C3B" opacity=".5">
        <rect x="0" y="206" width="128" height="60" />
        <rect x="146" y="190" width="92" height="76" />
        <path d="M252 266V208q16-52 32 0v58z" />
        <rect x="300" y="200" width="116" height="66" />
        <path d="M430 266v-44q42-42 84 0v44z" />
        <rect x="528" y="212" width="104" height="54" />
        <rect x="646" y="198" width="88" height="68" />
        <path d="M748 266V214q15-48 30 0v52z" />
        <rect x="1046" y="200" width="154" height="66" />
      </g>

      <g fill="#5E3212">
        <rect x="-10" y="228" width="150" height="52" />
        <path d="M60 228V206h34v22z" />
        <rect x="152" y="214" width="104" height="66" />
        <path d="M170 214v-16h68v16z" />
        <path d="M282 280V216q22-74 44 0v64z" />
        <path d="M298 152h12v22h-12z" />
        <circle cx="304" cy="146" r="7" />
        <rect x="342" y="232" width="128" height="48" />
        <path d="M486 280v-34q34-40 68 0v34z" />
        <rect x="492" y="276" width="56" height="8" />
        <path d="M516 208h8v18h-8z" />
        <rect x="572" y="222" width="112" height="58" />
        <path d="M590 222v-18h76v18z" />
        <path d="M700 280V224q19-66 38 0v56z" />
        <path d="M714 164h10v20h-10z" />
        <rect x="756" y="238" width="96" height="42" />
        <rect x="962" y="230" width="118" height="50" />
        <path d="M1096 280v-40q30-36 60 0v40z" />
        <rect x="1150" y="220" width="60" height="60" />
      </g>

      <rect x="0" y="280" width="1200" height="13" fill="#6B3A14" />
      <rect x="0" y="293" width="1200" height="13" fill="#79441B" />
      <rect x="0" y="306" width="1200" height="13" fill="#874E22" />
      <rect x="0" y="319" width="1200" height="13" fill="#955829" />
      <rect x="0" y="332" width="1200" height="12" fill="#A36230" />

      <g fill="#4A2A12" opacity=".8">
        <path d="M120 306a7 7 0 1114 0v14h-14zM138 293a6 6 0 1112 0v13h-12zM402 319a7 7 0 1114 0v13h-14zM640 293a6 6 0 1112 0v13h-12zM658 306a7 7 0 1114 0v13h-14zM930 319a6 6 0 1112 0v13h-12z" />
      </g>

      <rect x="0" y="344" width="1200" height="96" fill="url(#bt-river)" />

      <g fill="#FFE6BE" opacity=".38">
        <rect x="836" y="352" width="88" height="5" rx="2.5" />
        <rect x="848" y="368" width="64" height="4" rx="2" />
        <rect x="840" y="384" width="80" height="4" rx="2" />
        <rect x="856" y="400" width="48" height="3.5" rx="1.75" />
        <rect x="844" y="416" width="72" height="3.5" rx="1.75" />
      </g>
      <g fill="#FFE6BE" opacity=".16">
        <rect x="80" y="362" width="150" height="4" rx="2" />
        <rect x="300" y="392" width="190" height="4" rx="2" />
        <rect x="560" y="372" width="120" height="4" rx="2" />
        <rect x="1000" y="404" width="160" height="4" rx="2" />
      </g>

      <g fill="#3F2617">
        <path d="M150 392h130l-20 26H170z" />
        <rect x="208" y="342" width="5" height="50" />
        <path d="M186 386a8 8 0 1116 0v6h-16zM240 386a8 8 0 1116 0v6h-16z" />
        <path d="M560 358h84l-13 18h-58z" />
        <rect x="598" y="322" width="4" height="36" />
        <path d="M940 404h108l-17 22h-74z" />
        <path d="M972 398a7 7 0 1114 0v6h-14z" />
      </g>

      <g>
        <circle cx="420" cy="368" r="4.5" fill="#FFE9B0" />
        <circle cx="470" cy="386" r="3.5" fill="#FFD98A" />
        <circle cx="352" cy="404" r="4" fill="#FFE9B0" />
        <circle cx="722" cy="374" r="4" fill="#FFD98A" />
        <circle cx="778" cy="398" r="3.5" fill="#FFE9B0" />
        <circle cx="672" cy="418" r="4.5" fill="#FFD98A" />
      </g>
    </svg>
  );
});
