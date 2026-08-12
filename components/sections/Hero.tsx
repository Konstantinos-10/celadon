"use client";

/* Scroll scrubbed hero. The bottle video is pre-extracted into motion
   interpolated frames and drawn onto a canvas. Smoothness comes from three
   layers: interpolated source frames, a rAF lerp toward the scroll target,
   and a sub-frame cross-blend between neighbouring frames.

   The track is SCRUB_VH plus one extra viewport. The stage stays pinned for
   the whole track, the overlay clusters exit on scroll early in the scrub,
   the frames finish at FRAME_END and hold, and the next section is pulled
   up by 100svh in page.tsx so it slides over the held frame. The moment it
   covers the viewport the track ends and the stage unpins, which keeps the
   fixed footer reveal at the end of the page intact. */

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";

/* Config */
const FRAME_COUNT = 298;
const SCRUB_VH = 350;
const FRAME_END = 0.6;
const SMOOTH = 0.16;
const NARROW_QUERY = "(max-width: 860px)";
const BG = "#e8e5dd";
const EASE = [0.16, 1, 0.3, 1] as const;
const framePath = (i: number) =>
  `/hero/frames/scrub/frame_${String(i).padStart(3, "0")}.jpg`;
const FALLBACK_FRAME = framePath(1);

/* Scroll windows for the three exit animations. Everything has fully
   left the stage by a fifth of the track, and because each value is a
   pure function of scroll progress the exits play backwards on the way
   up and the stage rebuilds itself. */
const TITLE_RANGE: [number, number] = [0.04, 0.2];
const CARD_RANGES: [number, number][] = [
  [0.02, 0.1],
  [0.06, 0.14],
  [0.1, 0.18],
];
const CTA_RANGE: [number, number] = [0.04, 0.16];

export default function Hero() {
  const reduce = useReducedMotion();
  const [narrow, setNarrow] = useState(false);

  const trackRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const targetRef = useRef(0);
  const currentRef = useRef(0);
  const drawnRef = useRef(-1);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  /* The static fallback has no scrub track, so it gets a progress value
     that stays at zero and keeps every cluster in its resting state */
  const still = useMotionValue(0);

  useEffect(() => {
    const mq = window.matchMedia(NARROW_QUERY);
    const update = () => setNarrow(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const active = !reduce && !narrow;

  /* object-fit cover draw of one frame */
  const drawCover = useCallback((img: HTMLImageElement | undefined) => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx || !img || !img.complete || !img.naturalWidth)
      return false;
    const cw = canvas.width;
    const ch = canvas.height;
    const ir = img.naturalWidth / img.naturalHeight;
    let dw: number;
    let dh: number;
    if (cw / ch > ir) {
      dw = cw;
      dh = cw / ir;
    } else {
      dh = ch;
      dw = ch * ir;
    }
    ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
    return true;
  }, []);

  /* blended sub-frame at continuous position pos */
  const drawAt = useCallback(
    (pos: number) => {
      const ctx = ctxRef.current;
      if (!ctx) return;
      const imgs = imagesRef.current;
      const i0 = Math.max(0, Math.min(FRAME_COUNT - 1, Math.floor(pos)));
      const i1 = Math.min(FRAME_COUNT - 1, i0 + 1);
      const frac = pos - Math.floor(pos);
      ctx.globalAlpha = 1;
      const base = drawCover(imgs[i0]);
      if (base && frac > 0.01 && i1 !== i0) {
        ctx.globalAlpha = frac;
        drawCover(imgs[i1]);
        ctx.globalAlpha = 1;
      }
    },
    [drawCover]
  );

  /* preload every frame; the live matchMedia guard keeps phones from ever
     starting the download */
  useEffect(() => {
    if (!active) return;
    if (window.matchMedia(NARROW_QUERY).matches) return;
    const imgs: HTMLImageElement[] = [];
    let first = true;
    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new window.Image();
      img.decoding = "async";
      img.src = framePath(i);
      img.onload = () => {
        if (first) {
          first = false;
          drawAt(currentRef.current);
        }
      };
      imgs.push(img);
    }
    imagesRef.current = imgs;
    return () => {
      imagesRef.current = [];
    };
  }, [active, drawAt]);

  /* size the backing store to box times DPR, fill bone so there is no black
     flash before the first frame decodes, then redraw */
  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    ctxRef.current = canvas.getContext("2d", { alpha: false });
    if (ctxRef.current) ctxRef.current.imageSmoothingQuality = "high";
    const resize = () => {
      const ctx = ctxRef.current;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = canvas.getBoundingClientRect();
      canvas.width = Math.round(r.width * dpr);
      canvas.height = Math.round(r.height * dpr);
      if (ctx) {
        ctx.fillStyle = BG;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.imageSmoothingQuality = "high";
      }
      drawnRef.current = -1;
      drawAt(currentRef.current);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [active, drawAt]);

  /* scroll to continuous target frame, no rounding */
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const t = Math.min(1, Math.max(0, p) / FRAME_END);
    targetRef.current = t * (FRAME_COUNT - 1);
  });

  /* rAF lerp loop, paused while off screen */
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const tick = () => {
      const cur = currentRef.current;
      const tgt = targetRef.current;
      const diff = tgt - cur;
      const next = Math.abs(diff) < 0.004 ? tgt : cur + diff * SMOOTH;
      currentRef.current = next;
      if (Math.abs(next - drawnRef.current) > 0.002) {
        drawAt(next);
        drawnRef.current = next;
      }
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !raf) raf = requestAnimationFrame(tick);
        else if (!entry.isIntersecting && raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      },
      { rootMargin: "300px 0px" }
    );
    if (trackRef.current) io.observe(trackRef.current);
    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [active, drawAt]);

  /* reduced motion and phones get a static frame with all copy shown. The
     extra viewport of bone below keeps the 100svh pull in page.tsx from
     covering the visible content. */
  if (!active) {
    return (
      <section className="relative bg-bone">
        <div className="relative min-h-svh overflow-hidden">
          <Image
            src={FALLBACK_FRAME}
            alt=""
            fill
            sizes="100vw"
            priority
            style={{ objectFit: "cover" }}
          />
          <Overlay progress={still} animate={!reduce} />
        </div>
        <div aria-hidden className="h-svh" />
      </section>
    );
  }

  return (
    <section
      ref={trackRef}
      className="relative bg-bone"
      style={{ height: `calc(${SCRUB_VH}vh + 100svh)` }}
    >
      <div className="sticky top-0 h-svh overflow-hidden bg-bone">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 block h-full w-full"
        />
        <Sleep progress={scrollYProgress} />
        <Overlay progress={scrollYProgress} animate />
      </div>
    </section>
  );
}

/* The held frame washes toward bone while the next section covers it,
   so the product visibly recedes instead of being cut mid-body by the
   advancing edge. The cover begins around 0.72 of the track. */
function Sleep({ progress }: { progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [0.72, 1], [0, 0.55]);
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute inset-0 bg-bone"
      style={{ opacity }}
    />
  );
}

/* Overlay */

const NOTES = [
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

/* Mount reveal used inside the scroll driven wrappers */
function Rise({
  animate,
  delay,
  children,
}: {
  animate: boolean;
  delay: number;
  children: ReactNode;
}) {
  return (
    <motion.div
      initial={animate ? { opacity: 0, y: 12 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/* Cards exit one by one, sliding out to the left */
function NoteCard({
  progress,
  range,
  animate,
  delay,
  note,
}: {
  progress: MotionValue<number>;
  range: [number, number];
  animate: boolean;
  delay: number;
  note: (typeof NOTES)[number];
}) {
  /* Slide fully past the left viewport edge, then unmount from painting
     entirely so nothing lingers at near zero opacity */
  const x = useTransform(progress, range, ["0vw", "-45vw"]);
  const opacity = useTransform(progress, range, [1, 0]);
  const visibility = useTransform(opacity, (v) =>
    v < 0.02 ? "hidden" : "visible"
  );
  return (
    <motion.li style={{ x, opacity, visibility }}>
      <Rise animate={animate} delay={delay}>
        <div className="bg-bone-deep/85 p-5">
          <h2 className="font-display text-xl">{note.name}</h2>
          <p className="mt-2 text-small">{note.notes}</p>
          <p className="mt-3 text-small text-muted">{note.window}</p>
        </div>
      </Rise>
    </motion.li>
  );
}

function Overlay({
  progress,
  animate,
}: {
  progress: MotionValue<number>;
  animate: boolean;
}) {
  /* The wordmark sinks fully below the bottom edge and softens */
  const titleY = useTransform(progress, TITLE_RANGE, ["0%", "115%"]);
  const titleOpacity = useTransform(progress, TITLE_RANGE, [1, 0]);
  const titleScale = useTransform(progress, TITLE_RANGE, [1, 0.96]);
  const titleVisibility = useTransform(titleOpacity, (v) =>
    v < 0.02 ? "hidden" : "visible"
  );

  /* The description and button slide fully past the right viewport edge */
  const ctaX = useTransform(progress, CTA_RANGE, ["0vw", "45vw"]);
  const ctaOpacity = useTransform(progress, CTA_RANGE, [1, 0]);
  const ctaVisibility = useTransform(ctaOpacity, (v) =>
    v < 0.02 ? "hidden" : "visible"
  );

  return (
    <div className="pointer-events-none absolute inset-0 z-10 max-md:relative max-md:inset-auto">
      <div className="relative flex h-full min-h-svh flex-col justify-between gap-12 p-[var(--page-margin)] pb-[2vh] md:block md:p-0">
        {/* Top left: the three layers of the composition, stacked */}
        <ul className="flex w-full flex-col gap-4 md:absolute md:left-[var(--page-margin)] md:top-[clamp(2rem,6vh,4.5rem)] md:w-[15.5rem]">
          {NOTES.map((note, i) => (
            <NoteCard
              key={note.name}
              note={note}
              progress={progress}
              range={CARD_RANGES[i]}
              animate={animate}
              delay={0.15 + i * 0.12}
            />
          ))}
        </ul>

        {/* Top right: description and button */}
        <motion.div
          style={{ x: ctaX, opacity: ctaOpacity, visibility: ctaVisibility }}
          className="md:absolute md:right-[var(--page-margin)] md:top-[clamp(2rem,6vh,4.5rem)] md:max-w-[30ch] md:text-right"
        >
          <Rise animate={animate} delay={0.3}>
            <p className="text-body text-muted">
              The same formula at four strengths. From a two hour cologne
              to a twelve hour extrait, only the intensity changes.
            </p>
            <a
              href="#acquire"
              className="pointer-events-auto mt-6 inline-block bg-ink px-7 py-3.5 text-small font-medium text-bone transition-colors duration-300 hover:bg-celadon-deep"
            >
              Acquire the composition
            </a>
          </Rise>
        </motion.div>

        {/* Bottom centre: the wordmark, near full width, fading downward */}
        <motion.div
          style={{
            y: titleY,
            opacity: titleOpacity,
            scale: titleScale,
            visibility: titleVisibility,
          }}
          className="md:absolute md:inset-x-0 md:bottom-0"
        >
          <Rise animate={animate} delay={0.05}>
            <h1
              className="whitespace-nowrap text-center font-display text-[clamp(3.25rem,17.5vw,19rem)] leading-[0.82] tracking-[-0.02em]"
              style={{
                backgroundImage:
                  "linear-gradient(180deg, #171a16 0%, rgba(23, 26, 22, 0) 112%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              CELADON
            </h1>
          </Rise>
        </motion.div>
      </div>
    </div>
  );
}
