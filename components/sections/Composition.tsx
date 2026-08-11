"use client";

/* Composition. A time axis reading downward: three rows descend as a
   staircase over the empty half of the portrait. A single polyline is
   drawn from top to bottom by scroll, stepping right at each row, and a
   serif numeral rides the same path via offset-path, switching from 01
   to 02 to 03 as it arrives at each layer. The row it has reached
   deepens from muted to ink. The portrait's dark backdrop is dissolved
   into the light ground by a gradient so the section stays bone. */

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const ROWS = [
  {
    name: "Top",
    notes: "Bergamot, green mandarin, pink pepper",
    window: "0 to 15 minutes",
  },
  {
    name: "Heart",
    notes: "Iris, vetiver, neroli",
    window: "15 minutes to 3 hours",
  },
  {
    name: "Base",
    notes: "Oakmoss, cedar, ambrette",
    window: "3 hours onward",
  },
];

/* Staircase indents as fractions of the container width */
const INDENTS = [0, 0.06, 0.12];
/* The corner of each step sits this far below the row's top edge */
const CORNER_OFFSET = 32;

export default function Composition() {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const numeralRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const geomRef = useRef({ length: 0, fractions: [0, 0, 0] });
  const lastReachedRef = useRef(-2);
  const [reached, setReached] = useState(-1);

  useEffect(() => {
    const wrap = wrapRef.current;
    const path = pathRef.current;
    const numeral = numeralRef.current;
    const section = sectionRef.current;
    if (!wrap || !path || !numeral || !section) return;

    /* Measure the rows and rebuild the path through their staircase */
    const build = () => {
      const W = wrap.clientWidth;
      const H = wrap.clientHeight;
      const tops = rowRefs.current.map((r) => r?.offsetTop ?? 0);
      const x = INDENTS.map((f) => f * W);
      const sy1 = tops[1] + CORNER_OFFSET;
      const sy2 = tops[2] + CORNER_OFFSET;

      const d = `M ${x[0]} 0 V ${sy1} H ${x[1]} V ${sy2} H ${x[2]} V ${H}`;
      path.setAttribute("d", d);
      numeral.style.offsetPath = `path("${d}")`;
      numeral.style.offsetRotate = "0deg";

      const length =
        sy1 + (x[1] - x[0]) + (sy2 - sy1) + (x[2] - x[1]) + (H - sy2);
      geomRef.current = {
        length,
        fractions: [
          (tops[0] + CORNER_OFFSET) / length,
          (sy1 + (x[1] - x[0])) / length,
          (sy1 + (x[1] - x[0]) + (sy2 - sy1) + (x[2] - x[1])) / length,
        ],
      };
      path.style.strokeDasharray = `${length}px`;
    };

    const apply = (p: number) => {
      const { length, fractions } = geomRef.current;
      path.style.strokeDashoffset = `${length * (1 - p)}px`;
      numeral.style.offsetDistance = `${p * 100}%`;
      const r =
        p >= fractions[2] ? 2 : p >= fractions[1] ? 1 : p >= fractions[0] ? 0 : -1;
      if (r !== lastReachedRef.current) {
        lastReachedRef.current = r;
        setReached(r);
      }
    };

    build();

    if (reduce) {
      apply(1);
      return;
    }

    apply(0);
    const st = ScrollTrigger.create({
      trigger: section,
      start: "top 70%",
      end: "bottom 70%",
      onUpdate: (self) => apply(self.progress),
      onRefresh: (self) => {
        build();
        apply(self.progress);
      },
    });

    const onResize = () => {
      build();
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", onResize);
    return () => {
      st.kill();
      window.removeEventListener("resize", onResize);
    };
  }, [reduce]);

  const numeralText = `0${(reached < 0 ? 0 : reached) + 1}`;

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-bone-deep">
      <Image
        src="/woman.png"
        alt=""
        fill
        sizes="100vw"
        className="object-cover object-right"
      />
      {/* Dissolves the portrait's dark backdrop into the light ground so
         the section reads as bone with the subject at the right edge */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, var(--bone-deep) 0%, var(--bone-deep) 46%, rgba(222, 218, 208, 0) 80%)",
        }}
      />

      <div className="page-shell section-pad relative z-10">
        <div ref={wrapRef} className="relative flex flex-col gap-[16vh]">
          <svg
            aria-hidden
            className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
          >
            <path
              ref={pathRef}
              fill="none"
              stroke="var(--celadon)"
              strokeWidth={1.5}
            />
          </svg>

          {/* Rides the path; reads 01, 02, 03 as it arrives at each row */}
          <div
            ref={numeralRef}
            aria-hidden
            className="pointer-events-none absolute left-0 top-0 font-display text-numeral text-ink"
          >
            {numeralText}
          </div>

          {ROWS.map((row, i) => (
            <div
              key={row.name}
              ref={(el) => {
                rowRefs.current[i] = el;
              }}
              className={`pl-[clamp(3.5rem,7vw,6rem)] transition-colors duration-700 ${
                reached >= i ? "text-ink" : "text-muted"
              }`}
              style={{ marginLeft: `${INDENTS[i] * 100}%` }}
            >
              <h3 className="text-h1">{row.name}</h3>
              <p className="mt-3 text-h2">{row.notes}</p>
              <p className="mt-4 text-small">{row.window}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
