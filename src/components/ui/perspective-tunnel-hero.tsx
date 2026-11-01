"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "@phosphor-icons/react";
import { sitePath } from "../../paths";
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
const ease = [0.23, 1, 0.32, 1] as const;

export default function PerspectiveTunnelHero({
  images,
  onStartProject,
  onSelectPool,
}: PerspectiveTunnelHeroProps) {
  const ref = useRef<HTMLElement>(null);
  const [reduce, setReduce] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const query = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduce(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const photoTransform = useTransform(
    scrollYProgress,
    [0, 1],
    ["translateY(0px) scale(1.035)", "translateY(38px) scale(1.07)"],
  );
  const inspirations = images.filter(
    (pool) => pool.id === "white" || pool.id === "black",
  );
  return (
    <section className="pool-hero" ref={ref} aria-labelledby="hero-title">
      <div className="pool-hero-top">
        <h1 id="hero-title" aria-label="baulipa">
          <span className="hero-name-part">
            <motion.span
              initial={reduce ? false : { transform: "translateY(110%)" }}
              animate={{ transform: "translateY(0%)" }}
              transition={{ duration: 0.9, delay: 0.12, ease }}
            >
              bau
            </motion.span>
          </span>
          <span className="hero-name-part hero-name-blue">
            <motion.span
              initial={reduce ? false : { transform: "translateY(110%)" }}
              animate={{ transform: "translateY(0%)" }}
              transition={{ duration: 0.9, delay: 0.22, ease }}
            >
              lipa
            </motion.span>
          </span>
        </h1>
        <motion.div
          className="pool-hero-copy"
          initial={
            reduce ? false : { opacity: 0, transform: "translateY(18px)" }
          }
          animate={{ opacity: 1, transform: "translateY(0px)" }}
          transition={{ duration: 0.7, delay: 0.35, ease }}
        >
          <p>
            Swimming pools, thoughtfully built.
            <br />
            Made for your kind of summer.
          </p>
          <div className="pool-hero-actions">
            <a href="#pools" className="action">
              <span>Find your pool</span>
              <span className="action-icon">
                <ArrowUpRight size={20} />
              </span>
            </a>
            <button className="pool-hero-project" onClick={onStartProject}>
              Start your project <ArrowUpRight size={17} />
            </button>
          </div>
        </motion.div>
      </div>
      <motion.figure
        className="pool-hero-scene"
        initial={reduce ? false : { clipPath: "inset(16% 0 0 0)", opacity: 0 }}
        animate={{ clipPath: "inset(0% 0 0 0)", opacity: 1 }}
        transition={{ duration: 1.1, delay: 0.15, ease }}
      >
        <motion.img
          className="pool-hero-photo"
          src={sitePath("/images/pool-hero.webp")}
          alt="Sunlit turquoise swimming pool beside a stone home and Mediterranean pines"
          width="1672"
          height="941"
          fetchPriority="high"
          style={{ transform: reduce ? "none" : photoTransform }}
        />
        <figcaption>A life by the water.</figcaption>
        <div
          className="pool-hero-inspirations"
          aria-label="Explore more pool finishes"
        >
          {inspirations.map((pool) => (
            <button
              key={pool.id}
              onClick={() => onSelectPool(pool)}
              aria-label={`Explore ${pool.type}`}
            >
              <img
                src={pool.thumbnail || pool.image}
                alt=""
                width="100"
                height="80"
              />
              <ArrowUpRight size={16} />
            </button>
          ))}
        </div>
      </motion.figure>
    </section>
  );
}
