"use client";

/* Footer. Fixed behind the page at z-index 0; the main element scrolls
   past and uncovers it, so this element never moves itself. The
   wordmark is set at whatever size fills the viewport edge to edge
   (measured, then corrected on resize and font load) and sits on the
   baseline at the very bottom so the area below it is cropped by the
   screen edge. While the footer is being uncovered the wordmark rises
   60px against the scroll, written directly to the element so no
   re-render can reset it. */

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

const LINKS = [
  { label: "Acquire", href: "#acquire" },
  { label: "Instagram", href: "#" },
  { label: "Contact", href: "mailto:studio@celadon.house" },
];

const COMPOSITION_LINE =
  "Bergamot, green mandarin, pink pepper. Iris, vetiver, neroli. Oakmoss, cedar, ambrette.";

/* The four strengths as a numeral ladder; opacity deepens down the
   list the way the liquid deepens through the descent */
const STRENGTHS = [
  { numeral: "03", label: "Cologne", tone: "text-bone/30" },
  { numeral: "09", label: "Toilette", tone: "text-bone/45" },
  { numeral: "18", label: "Parfum", tone: "text-bone/60" },
  { numeral: "27", label: "Extrait", tone: "text-bone/80" },
];

export default function Footer() {
  const reduce = useReducedMotion();
  const wordRef = useRef<HTMLDivElement>(null);
  const riseRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState(200);
  const [fitted, setFitted] = useState(false);

  /* Scale the current size by the ratio between the viewport and the
     rendered width; repeated calls converge on edge to edge */
  const fit = useCallback(() => {
    const el = wordRef.current;
    if (!el) return;
    const w = el.getBoundingClientRect().width;
    if (w > 0) {
      const ratio = window.innerWidth / w;
      if (Math.abs(ratio - 1) > 0.005) {
        setFontSize((s) => s * ratio);
      }
      setFitted(true);
    }
  }, []);

  useEffect(() => {
    fit();
    document.fonts.ready.then(fit);
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [fit, fontSize]);

  /* Uncover progress: the last viewport of scroll, as main slides off */
  useEffect(() => {
    if (reduce) return;
    const onScroll = () => {
      const max =
        document.documentElement.scrollHeight - window.innerHeight;
      const t = Math.min(
        1,
        Math.max(0, 1 - (max - window.scrollY) / window.innerHeight)
      );
      if (riseRef.current) {
        riseRef.current.style.transform = `translateY(${(1 - t) * 60}px)`;
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [reduce]);

  return (
    <footer className="fixed bottom-0 left-0 right-0 top-auto z-0 h-screen overflow-hidden bg-celadon-deep text-bone">
      {/* Three links and one line of the composition. Nothing else. */}
      <div className="absolute left-[var(--page-margin)] top-[14vh]">
        <nav className="flex flex-col items-start gap-2">
          {LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-body text-bone/70 transition-colors duration-300 hover:text-bone"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <p className="mt-10 max-w-[26ch] font-display text-h2 text-bone/80">
          {COMPOSITION_LINE}
        </p>
      </div>

      {/* Top right: the strengths ladder, mirroring the links block */}
      <div className="absolute right-[var(--page-margin)] top-[14vh] hidden text-right md:block">
        <p className="text-small uppercase tracking-[0.16em] text-bone/40">
          Four strengths
        </p>
        <ul className="mt-6 flex flex-col items-end gap-4">
          {STRENGTHS.map((s) => (
            <li key={s.numeral} className="flex items-baseline gap-4">
              <span className="text-small uppercase tracking-[0.16em] text-bone/40">
                {s.label}
              </span>
              <span
                className={`font-display text-[clamp(2rem,3vw,3rem)] leading-none ${s.tone}`}
              >
                {s.numeral}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* The wordmark is the entire composition */}
      <div className="absolute inset-x-0 bottom-0">
        <div ref={riseRef}>
          <div
            ref={wordRef}
            className={`w-fit whitespace-nowrap font-display leading-none tracking-[-0.02em] transition-opacity duration-700 ${
              fitted ? "opacity-100" : "opacity-0"
            } -mb-[0.21em]`}
            style={{ fontSize }}
          >
            CELADON
          </div>
        </div>
      </div>
    </footer>
  );
}
