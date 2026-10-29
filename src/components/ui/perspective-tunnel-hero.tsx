"use client";

import {
  motion,
  useTransform,
  useReducedMotion,
  useMotionValue,
  useSpring,
  useScroll,
  type MotionValue,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, ArrowDown } from "@phosphor-icons/react";
import "./perspective-tunnel-hero.css";

export interface PoolInspiration {
  id: string;
  title: string;
  type: string;
  image: string;
  thumbnail?: string;
  description: string;
  features: string[];
}

interface PerspectiveTunnelHeroProps {
  images: PoolInspiration[];
  onStartProject: () => void;
  onSelectPool: (pool: PoolInspiration) => void;
}

interface StageDimensions {
  width: number;
  height: number;
  isMobile: boolean;
}
interface Placement {
  x: number;
  y: number;
  z: number;
  rotation: number;
}

// A central reading area stays clear while the images establish the tunnel's depth.
const DESKTOP_PLACEMENTS: Placement[] = [
  { x: -0.34, y: -0.27, z: 55, rotation: -11 },
  { x: 0.35, y: -0.27, z: -25, rotation: 10 },
  { x: -0.43, y: 0.24, z: -140, rotation: -7 },
  { x: 0.43, y: 0.26, z: 35, rotation: 9 },
  { x: -0.15, y: 0.54, z: -300, rotation: -8 },
  { x: 0.12, y: -0.59, z: -370, rotation: 7 },
];
const MOBILE_PLACEMENTS: Placement[] = [
  { x: -0.29, y: -0.32, z: 0, rotation: -10 },
  { x: 0.29, y: -0.32, z: -30, rotation: 9 },
  { x: -0.3, y: 0.35, z: -20, rotation: -7 },
  { x: 0.3, y: 0.35, z: 0, rotation: 8 },
  { x: -0.8, y: 0.01, z: -280, rotation: -9 },
  { x: 0.8, y: -0.01, z: -300, rotation: 9 },
];

function TunnelCard({
  item,
  index,
  progress,
  pointer,
  stage,
  reduced,
  onSelect,
}: {
  item: PoolInspiration;
  index: number;
  progress: MotionValue<number>;
  pointer: { x: MotionValue<number>; y: MotionValue<number> };
  stage: StageDimensions;
  reduced: boolean;
  onSelect: (pool: PoolInspiration) => void;
}) {
  const placement = (stage.isMobile ? MOBILE_PLACEMENTS : DESKTOP_PLACEMENTS)[
    index % 6
  ];
  const cardWidth = stage.isMobile
    ? Math.max(125, Math.min(175, stage.width * 0.35))
    : Math.max(180, Math.min(290, stage.width * 0.2));
  const transform = useTransform(
    [progress, pointer.x, pointer.y],
    (values: number[]) => {
      const [scroll, px, py] = values;
      const travel = reduced ? 0 : scroll;
      // Stay in front of the camera plane: crossing it creates a huge raster and a visual flip.
      const z = placement.z + travel * (stage.isMobile ? 650 : 950);
      const pan = stage.isMobile || reduced ? 0 : 28;
      const x = stage.width * placement.x - px * pan;
      const y = stage.height * placement.y - py * pan;
      return `translate3d(calc(-50% + ${x}px), calc(-50% + ${y}px), ${z}px) rotateZ(${placement.rotation * (1 + travel * 0.35)}deg)`;
    },
  );
  const opacity = useTransform(progress, [0, 0.48, 0.8, 1], [1, 1, 0.35, 0]);
  return (
    <motion.div
      className="tunnel-card-position"
      style={{ width: cardWidth, transform, opacity: reduced ? 1 : opacity }}
    >
      <motion.button
        className="tunnel-card"
        aria-label={`Explore ${item.type}`}
        onClick={() => onSelect(item)}
        initial={
          reduced
            ? false
            : { opacity: 0, transform: "translateY(24px) scale(.96)" }
        }
        animate={{ opacity: 1, transform: "translateY(0px) scale(1)" }}
        transition={{
          duration: 0.85,
          delay: 0.12 + index * 0.07,
          ease: [0.23, 1, 0.32, 1],
        }}
      >
        <img
          src={item.thumbnail || item.image}
          alt={item.type}
          width="700"
          height="525"
          draggable={false}
          fetchPriority={index < 2 ? "high" : "auto"}
        />
        <span className="tunnel-card-caption">
          <span>{item.type}</span>
          <ArrowUpRight size={14} />
        </span>
      </motion.button>
    </motion.div>
  );
}

export default function PerspectiveTunnelHero({
  images,
  onStartProject,
  onSelectPool,
}: PerspectiveTunnelHeroProps) {
  const containerRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const reduce = !!useReducedMotion();
  const [stage, setStage] = useState<StageDimensions>({
    width: 1440,
    height: 900,
    isMobile: false,
  });
  const [finePointer, setFinePointer] = useState(false);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });
  const progress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 30,
    restDelta: 0.0001,
  });
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 60, damping: 25, mass: 0.5 });
  const y = useSpring(rawY, { stiffness: 60, damping: 25, mass: 0.5 });
  const titleTransform = useTransform(
    progress,
    [0, 0.5, 1],
    [
      "translateY(0px) scale(1)",
      "translateY(-8px) scale(1.035)",
      "translateY(-30px) scale(1.09)",
    ],
  );
  const titleOpacity = useTransform(progress, [0, 0.65, 1], [1, 1, 0]);
  const promptOpacity = useTransform(progress, [0, 0.15], [1, 0]);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const update = () =>
      setStage({
        width: el.clientWidth,
        height: el.clientHeight,
        isMobile: el.clientWidth < 768,
      });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    const pointerQuery = matchMedia("(hover: hover) and (pointer: fine)");
    const updatePointer = () => setFinePointer(pointerQuery.matches);
    updatePointer();
    pointerQuery.addEventListener("change", updatePointer);
    return () => {
      observer.disconnect();
      pointerQuery.removeEventListener("change", updatePointer);
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className={`perspective-hero ${reduce ? "is-reduced" : ""}`}
      aria-labelledby="hero-title"
    >
      <div
        ref={stageRef}
        className="tunnel-stage"
        onPointerMove={(e) => {
          if (reduce || !finePointer) return;
          rawX.set((e.clientX / window.innerWidth - 0.5) * 2);
          rawY.set((e.clientY / window.innerHeight - 0.5) * 2);
        }}
        onPointerLeave={() => {
          rawX.set(0);
          rawY.set(0);
        }}
      >
        <div className="tunnel-dots" aria-hidden="true" />
        <div className="tunnel-ring tunnel-ring-inner" aria-hidden="true" />
        <div className="tunnel-ring tunnel-ring-outer" aria-hidden="true" />
        <div
          className="tunnel-depth-plane"
          aria-label="Six different pool inspirations"
        >
          {images.slice(0, 6).map((item, index) => (
            <TunnelCard
              key={item.id}
              item={item}
              index={index}
              progress={progress}
              pointer={{ x, y }}
              stage={stage}
              reduced={reduce}
              onSelect={onSelectPool}
            />
          ))}
        </div>
        <motion.div
          className="tunnel-copy-position"
          style={{
            transform: reduce ? "none" : titleTransform,
            opacity: reduce ? 1 : titleOpacity,
          }}
        >
          <motion.div
            className="tunnel-copy"
            initial={
              reduce ? false : { opacity: 0, transform: "translateY(22px)" }
            }
            animate={{ opacity: 1, transform: "translateY(0px)" }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
          >
            <p className="tunnel-eyebrow">
              Your space. A world of possibilities.
            </p>
            <h1 id="hero-title">
              A life by
              <br />
              <span>the water.</span>
            </h1>
            <p className="tunnel-description">
              Considered pools. Everyday escapes.
              <br />
              Find the one that feels like you.
            </p>
            <div className="tunnel-actions">
              <a href="#pools" className="action">
                <span>Find your pool</span>
                <span className="action-icon">
                  <ArrowUpRight size={20} />
                </span>
              </a>
              <button className="tunnel-project-link" onClick={onStartProject}>
                Start your project <ArrowUpRight size={16} />
              </button>
            </div>
          </motion.div>
        </motion.div>
        <motion.a
          className="tunnel-scroll-link"
          href="#studio"
          style={{ opacity: reduce ? 1 : promptOpacity }}
        >
          <span>Scroll into the possibilities</span>
          <ArrowDown size={17} />
        </motion.a>
      </div>
    </section>
  );
}
