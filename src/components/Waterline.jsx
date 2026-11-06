import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { sitePath } from "../paths";
import "./waterline.css";

export default function Waterline() {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const motion = gsap.matchMedia(ref.current);
    motion.add("(prefers-reduced-motion: no-preference)", () => {
      const transition = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: ref.current,
          start: "top 90%",
          end: "bottom 15%",
          scrub: true,
        },
      });
      transition
        .fromTo(
          ".waterline-photo",
          { scale: 1.2, yPercent: -4 },
          { scale: 1.06, yPercent: 2, duration: 1 },
          0,
        )
        .fromTo(
          ".waterline-ripple circle",
          { scale: 0.22, opacity: 0.85, transformOrigin: "50% 50%" },
          { scale: 1.65, opacity: 0, duration: 0.51, stagger: 0.065 },
          0.16,
        )
        .to(".waterline-surface", { opacity: 0, duration: 0.26 }, 0.49)
        .fromTo(
          ".waterline-plan",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.24 },
          0.5,
        )
        .fromTo(
          ".waterline-plan-outline",
          { strokeDashoffset: 1 },
          { strokeDashoffset: 0, duration: 0.26 },
          0.5,
        );
    });
    return () => motion.revert();
  }, []);

  return (
    <div className="waterline" ref={ref} aria-hidden="true">
      <div className="waterline-surface">
        <img
          className="waterline-photo"
          src={sitePath("/images/pool-waterline.webp")}
          width="1672"
          height="941"
          loading="lazy"
          decoding="async"
          alt=""
        />
        <svg className="waterline-ripple" viewBox="0 0 320 320" fill="none">
          {[66, 105, 145].map((radius) => (
            <circle key={radius} cx="160" cy="160" r={radius} />
          ))}
        </svg>
        <div className="waterline-caption shell">
          <span />
          At the waterline
        </div>
      </div>

      <div className="waterline-plan">
        <svg viewBox="0 0 520 274" fill="none">
          <path
            className="waterline-plan-guides"
            d="M70 43H450M70 34V52M450 34V52M475 68V212M466 68H484M466 212H484M70 237H450M130 62V219M390 62V219M61 140H459"
          />
          <path
            className="waterline-plan-outline"
            pathLength="1"
            d="M101 68h318a31 31 0 0 1 31 31v82a31 31 0 0 1-31 31H101a31 31 0 0 1-31-31V99a31 31 0 0 1 31-31Z"
          />
          <path d="M100 69v142m20-143v144m20-144v144M254 140h12m-6-6v12" />
        </svg>
        <span>Pool plan · Study 01</span>
      </div>
    </div>
  );
}
