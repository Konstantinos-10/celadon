"use client";

/* The house. This content lives inside the Intensities pinned stage:
   once the descent empties and the light rises over the dark field, the
   heading cascades in letter by letter (the same motif as the
   concentration names, now ink on bone) and the image and paragraphs
   settle after it. A static variant covers narrow viewports and
   reduced motion. */

import Image from "next/image";
import { useRef } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  type MotionValue,
  type Variants,
} from "motion/react";

const EASE = [0.16, 1, 0.3, 1] as const;

const HEADING = "The house";

const PARAGRAPHS = [
  "Founded in 2021 in Ghent, by four people who wanted to make one thing properly rather than many things quickly. The house occupies a single still room, and every batch that leaves it has passed through the same four pairs of hands.",
  "Nothing here is seasonal. The formula does not change, the bottle does not change, and nothing ships before it has rested a full year. The only decision left to make is how much of the composition to carry.",
];

const IMAGE = { src: "/bottle frame 1.png", width: 1672, height: 941 };

const headingContainer: Variants = {
  show: { transition: { staggerChildren: 0.04, delayChildren: 0.1 } },
  exit: { transition: { staggerChildren: 0.016 } },
};

const headingLetter: Variants = {
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
    transition: { duration: 0.35, ease: "easeIn" },
  },
};

/* Image and paragraphs follow the heading cascade */
const settle: Variants = {
  hidden: { y: 48, opacity: 0 },
  show: (delay: number) => ({
    y: 0,
    opacity: 1,
    transition: { duration: 0.9, ease: EASE, delay },
  }),
  exit: { opacity: 0, transition: { duration: 0.3, ease: "easeIn" } },
};

export function HouseStage({
  progress,
  visible,
}: {
  progress: MotionValue<number>;
  visible: boolean;
}) {
  /* Gentle parallax on the image across the resting stretch of the
     pin, written directly so no re-render can reset it */
  const parallaxRef = useRef<HTMLDivElement>(null);
  useMotionValueEvent(progress, "change", (p) => {
    const t = Math.min(1, Math.max(0, (p - 0.8) / 0.2));
    if (parallaxRef.current) {
      parallaxRef.current.style.transform = `translateY(${(1 - t) * 40}px)`;
    }
  });

  return (
    <div
      className={`absolute inset-0 flex flex-col justify-center text-ink ${
        visible ? "" : "pointer-events-none"
      }`}
    >
      <div className="page-shell w-full">
        <AnimatePresence>
          {visible && (
            <motion.div key="house" exit="exit">
              <div className="h-[clamp(3.5rem,9vw,9.5rem)] overflow-hidden">
                <motion.h2
                  className="whitespace-nowrap font-display text-[clamp(2.75rem,7.5vw,8.5rem)] leading-none tracking-[-0.02em]"
                  variants={headingContainer}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                >
                  {HEADING.split("").map((ch, i) => (
                    <motion.span
                      key={i}
                      variants={headingLetter}
                      className="inline-block whitespace-pre"
                    >
                      {ch}
                    </motion.span>
                  ))}
                </motion.h2>
              </div>

              <div className="grid-12 mt-[6vh] items-start">
                <div className="col-span-5 flex flex-col gap-6">
                  {PARAGRAPHS.map((p, i) => (
                    <motion.p
                      key={i}
                      className="max-w-[38ch] text-body text-ink/80"
                      variants={settle}
                      custom={0.55 + i * 0.15}
                      initial="hidden"
                      animate="show"
                      exit="exit"
                    >
                      {p}
                    </motion.p>
                  ))}
                </div>

                {/* Parallax rides on the outer wrapper so it never
                   fights the entrance animation on the inner one */}
                <div ref={parallaxRef} className="col-span-6 col-start-7">
                  <motion.div
                    variants={settle}
                    custom={0.4}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                  >
                      <Image
                      src={IMAGE.src}
                      alt="The CELADON flacon at rest on a bone backdrop"
                      width={IMAGE.width}
                      height={IMAGE.height}
                      sizes="(max-width: 860px) 90vw, 44vw"
                      className="h-auto w-full"
                    />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* Calm in-flow version for narrow viewports and reduced motion */
export function HouseStatic() {
  return (
    <section className="bg-bone-deep text-ink">
      <div className="page-shell section-pad">
        <h2 className="text-h1">{HEADING}</h2>
        <div className="mt-10 flex flex-col gap-10">
          <Image
            src={IMAGE.src}
            alt="The CELADON flacon at rest on a bone backdrop"
            width={IMAGE.width}
            height={IMAGE.height}
            sizes="90vw"
            className="h-auto w-full"
          />
          <div className="flex flex-col gap-6">
            {PARAGRAPHS.map((p, i) => (
              <p key={i} className="max-w-[52ch] text-body text-ink/80">
                {p}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
