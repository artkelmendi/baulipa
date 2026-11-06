import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { sitePath } from "../paths";
import WaterReflections from "./ui/water-reflections";
import "./waterline.css";

export default function Waterline() {
  const ref = useRef(null);
  const imageRef = useRef(null);

  useLayoutEffect(() => {
    const motion = gsap.matchMedia(ref.current);
    motion.add("(prefers-reduced-motion: no-preference)", () => {
      const transition = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: ref.current,
          start: "top 75%",
          end: "bottom 18%",
          scrub: true,
        },
      });
      transition
        .fromTo(
          ".waterline-surface",
          { scale: 1.08, yPercent: -2 },
          { scale: 1.04, yPercent: 1.5, duration: 1 },
          0,
        )
        .to(".waterline-wash", { yPercent: -11, duration: 0.6 }, 0.4);
    });
    return () => motion.revert();
  }, []);

  return (
    <div className="waterline" id="waterline" ref={ref} aria-hidden="true">
      <div className="waterline-surface">
        <img
          ref={imageRef}
          className="waterline-photo"
          src={sitePath("/images/pool-waterline.webp")}
          width="1672"
          height="941"
          loading="lazy"
          decoding="async"
          alt=""
        />
        <WaterReflections imageRef={imageRef} />
      </div>
      <div className="waterline-wash" />
    </div>
  );
}
