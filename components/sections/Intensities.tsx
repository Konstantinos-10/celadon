"use client";

/* Four intensities as The Descent, then the dawn. A pinned viewport on
   a deep green field. Scroll deepens everything at once: the bottle
   crossfades through the four renders and a radial glow behind it
   shifts through the four liquid hexes while the name and wear time
   roll per step. The pin then holds past the last step: every element
   leaves through its own edge, a bone layer rises over the dark field,
   and the house content cascades in on the light before the stage
   unpins into Acquire. */

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
  type Variants,
} from "motion/react";
import { HouseStage, HouseStatic } from "./House";

const EASE = [0.16, 1, 0.3, 1] as const;
const TRACK_VH = 650;
const NARROW_QUERY = "(max-width: 860px)";

/* The four steps play out over the first stretch of the track; the
   rest is the handoff: exits, the light rising, the house entering,
   then a beat of rest before the unpin. */
const DESCENT_END = 0.6;
const HOUSE_AT = 0.8;

/* 0 below a, 1 above b, linear between */
const ramp = (p: number, a: number, b: number) =>
  Math.min(1, Math.max(0, (p - a) / (b - a)));

const STEPS = [
  {
    name: "Eau de Cologne",
    oil: 3,
    hours: 2,
    img: "/bottle type 1.png",
  },
  {
    name: "Eau de Toilette",
    oil: 9,
    hours: 4,
    img: "/bottle type 2.png",
  },
  {
    name: "Eau de Parfum",
    oil: 18,
    hours: 7,
    img: "/bottle type 3.png",
  },
  {
    name: "Extrait de Parfum",
    oil: 27,
    hours: 12,
    img: "/bottle type 4.png",
  },
];

/* Midpoint of each step on the 0 to 1 track; the continuous values
   (glow, level, percentage) interpolate between these */
const CENTERS = [0.125, 0.375, 0.625, 0.875];

/* Crossfade windows around the step boundaries */
const FADES: { r: number[]; o: number[] }[] = [
  { r: [0.21, 0.29], o: [1, 0] },
  { r: [0.21, 0.29, 0.46, 0.54], o: [0, 1, 1, 0] },
  { r: [0.46, 0.54, 0.71, 0.79], o: [0, 1, 1, 0] },
  { r: [0.71, 0.79], o: [0, 1] },
];

const GLOWS = [
  "rgba(220, 229, 214, 0.38)",
  "rgba(185, 205, 178, 0.38)",
  "rgba(126, 155, 132, 0.4)",
  "rgba(63, 90, 70, 0.5)",
];

/* The concentration name at display scale. Each change cascades letter
   by letter: outgoing letters blur upward while incoming ones rise in
   from below, overlapping in place. */
const nameContainer: Variants = {
  show: { transition: { staggerChildren: 0.03, delayChildren: 0.06 } },
  exit: { transition: { staggerChildren: 0.016 } },
};

const nameLetter: Variants = {
  hidden: { y: "0.85em", opacity: 0, filter: "blur(10px)" },
  show: {
    y: 0,
    opacity: 1,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: EASE },
  },
  exit: {
    y: "-0.55em",
    opacity: 0,
    filter: "blur(8px)",
    transition: { duration: 0.4, ease: "easeIn" },
  },
};

function GiantName({ text, show }: { text: string; show: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-[5vh] h-[clamp(3.5rem,8.5vw,9.5rem)]">
      <AnimatePresence initial={false}>
        {show && (
          <motion.h3
            key={text}
            className="absolute inset-x-0 bottom-0 whitespace-nowrap text-center font-display text-[clamp(2.75rem,7.5vw,8.5rem)] leading-none tracking-[-0.02em] text-bone"
            variants={nameContainer}
            initial="hidden"
            animate="show"
            exit="exit"
          >
            {text.split("").map((ch, i) => (
              <motion.span
                key={i}
                variants={nameLetter}
                className="inline-block"
              >
              {ch === " " ? " " : ch}
              </motion.span>
            ))}
          </motion.h3>
        )}
      </AnimatePresence>
    </div>
  );
}

function BottleLayer({
  progress,
  index,
}: {
  progress: MotionValue<number>;
  index: number;
}) {
  const opacity = useTransform(progress, FADES[index].r, FADES[index].o);
  return (
    <motion.div className="absolute inset-0" style={{ opacity }}>
      <Image
        src={STEPS[index].img}
        alt=""
        width={2244}
        height={2804}
        sizes="(max-width: 860px) 80vw, 42vw"
        className="h-full w-auto"
        priority={index === 0}
      />
    </motion.div>
  );
}

export default function Intensities() {
  const reduce = useReducedMotion();
  const [narrow, setNarrow] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [showName, setShowName] = useState(true);
  const [houseIn, setHouseIn] = useState(false);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  useEffect(() => {
    const mq = window.matchMedia(NARROW_QUERY);
    const update = () => setNarrow(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  /* The original four-step choreography runs on this remapped value, so
     extending the track for the handoff changes nothing about its feel */
  const descent = useTransform(scrollYProgress, [0, DESCENT_END], [0, 1]);

  const glow = useTransform(descent, CENTERS, GLOWS);
  const glowBg = useTransform(
    glow,
    (g) =>
      `radial-gradient(46% 42% at 50% 56%, ${g} 0%, rgba(0,0,0,0) 70%)`
  );
  const scale = useTransform(descent, [0, 1], [1, 1.06]);

  /* The whole handoff — exits, the room going dark, the dawn — is
     written straight onto the elements from the scroll callback.
     Motion-value style bindings proved unreliable here: on the
     re-render that mounts the house they can snap back to their
     initial values, which dropped the dark stage back in behind the
     house. Direct writes cannot be reset by a re-render. */
  const glowRef = useRef<HTMLDivElement>(null);
  const pitchRef = useRef<HTMLDivElement>(null);
  const dawnRef = useRef<HTMLDivElement>(null);
  const bottleExitRef = useRef<HTMLDivElement>(null);
  const dataRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef<HTMLDivElement>(null);

  const applyHandoff = (p: number) => {
    const dark = ramp(p, 0.58, 0.66); // glow dies, pitch buries the green
    const exit = ramp(p, 0.6, 0.68); // elements leave
    const sink = ramp(p, 0.6, 0.7); // bottle travel
    const fade = ramp(p, 0.6, 0.66); // side rails fade
    const dawn = ramp(p, 0.66, 0.8); // bone rises over neutral pitch

    if (glowRef.current) glowRef.current.style.opacity = String(1 - dark);
    if (pitchRef.current) pitchRef.current.style.opacity = String(dark);
    if (dawnRef.current) dawnRef.current.style.opacity = String(dawn);

    const hidden = exit > 0.98 ? "hidden" : "visible";
    const b = bottleExitRef.current;
    if (b) {
      b.style.opacity = String(1 - exit);
      b.style.transform = `translateY(${sink * 30}vh)`;
      b.style.visibility = hidden;
    }
    const d = dataRef.current;
    if (d) {
      d.style.opacity = String(1 - fade);
      d.style.transform = `translateX(${exit * -45}vw)`;
      d.style.visibility = hidden;
    }
    const n = indexRef.current;
    if (n) {
      n.style.opacity = String(1 - fade);
      n.style.transform = `translateX(${exit * 30}vw)`;
      n.style.visibility = hidden;
    }
  };

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const d = Math.min(p / DESCENT_END, 1);
    const idx = d < 0.25 ? 0 : d < 0.5 ? 1 : d < 0.75 ? 2 : 3;
    setActive((cur) => (cur === idx ? cur : idx));
    setShowName(p < 0.61);
    setHouseIn(p > HOUSE_AT);
    applyHandoff(p);
  });

  /* Re-assert the handoff styles after every render, so nothing React
     does can leave them stale; also covers loading mid-track */
  useEffect(() => {
    applyHandoff(scrollYProgress.get());
  });

  /* Reduced motion and phones read the ladder as a calm stacked list,
     with the house following as a plain section */
  if (reduce || narrow) {
    return (
      <>
        <section className="bg-[linear-gradient(160deg,var(--celadon-deep),var(--pitch))] text-bone">
          <div className="page-shell section-pad flex flex-col gap-[10vh]">
            {STEPS.map((s) => (
              <div key={s.name} className="flex flex-col items-center text-center">
                <Image
                  src={s.img}
                  alt=""
                  width={2244}
                  height={2804}
                  sizes="80vw"
                  className="h-[36vh] w-auto"
                />
                <h3 className="mt-6 text-h2">{s.name}</h3>
                <p className="mt-2 text-small text-bone/70">
                  {s.oil} per cent oil, worn for {s.hours} hours
                </p>
              </div>
            ))}
          </div>
        </section>
        <HouseStatic />
      </>
    );
  }

  return (
    <section
      ref={trackRef}
      className="relative"
      style={{ height: `${TRACK_VH}vh` }}
    >
      <div className="sticky top-0 h-svh overflow-hidden bg-[linear-gradient(160deg,var(--celadon-deep)_0%,var(--pitch)_85%)] text-bone">
        {/* The room is lit by the liquid; the glow color stays on
           motion, its dimming is written directly in applyHandoff */}
        <motion.div
          ref={glowRef}
          aria-hidden
          className="absolute inset-0"
          style={{ background: glowBg }}
        />

        {/* The darkest moment: the descent bottoms out in pitch before
           the dawn, burying the green field under neutral black */}
        <div
          ref={pitchRef}
          aria-hidden
          className="absolute inset-0 bg-pitch"
          style={{ opacity: 0 }}
        />

        {/* The name at display scale, behind the bottle. Dropping the
           element lets its own letter cascade play the exit. */}
        <GiantName text={STEPS[active].name} show={showName} />

        {/* The bottle, crossfading through the four strengths, sinking
           out through the floor at the end of the descent. The exit
           travel lives on the outer wrapper via applyHandoff. */}
        <div ref={bottleExitRef} className="absolute inset-0">
          <motion.div
            className="absolute left-1/2 top-1/2 h-[62vh] -translate-x-1/2 -translate-y-1/2"
            style={{ scale }}
          >
            <div className="relative h-full w-[calc(62vh*2244/2804)]">
              {STEPS.map((_, i) => (
                <BottleLayer key={i} progress={descent} index={i} />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Wear data, rolling on each step, leaving through the left edge */}
        <div
          ref={dataRef}
          className="absolute left-[var(--page-margin)] top-1/2 -translate-y-1/2"
        >
          <div className="relative h-[3rem] w-[24ch] overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.p
                key={active}
                className="text-small text-bone/70"
                initial={{ opacity: 0, y: "1.2em" }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: "-1.2em" }}
                transition={{ duration: 0.45, ease: EASE }}
              >
                {STEPS[active].oil} per cent oil, worn for{" "}
                {STEPS[active].hours} hours
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* Step indices, leaving through the right edge */}
        <div
          ref={indexRef}
          className="absolute right-[var(--page-margin)] top-1/2 flex -translate-y-1/2 flex-col gap-4 text-right font-display text-xl"
        >
          {["01", "02", "03", "04"].map((n, i) => (
            <span
              key={n}
              className={`transition-colors duration-500 ${
                active === i ? "text-bone" : "text-bone/30"
              }`}
            >
              {n}
            </span>
          ))}
        </div>

        {/* Dawn layer: the light theme rising over the emptied dark stage */}
        <div
          ref={dawnRef}
          aria-hidden
          className="absolute inset-0 bg-bone-deep"
          style={{ opacity: 0 }}
        />

        {/* The house, entering on the light */}
        <HouseStage progress={scrollYProgress} visible={houseIn} />
      </div>
    </section>
  );
}
