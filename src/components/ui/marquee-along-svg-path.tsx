import { Children, useEffect, useRef, useState, type ReactNode } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useTransform,
  type MotionValue,
} from "framer-motion";
import "./marquee-along-svg-path.css";

type Point = { x: number; y: number };
interface Props {
  children: ReactNode;
  path: string;
  viewBox?: string;
  baseVelocity?: number;
  repeat?: number;
  className?: string;
}

// Adapted from the supplied SVG-path marquee: hooks live in stable child components,
// and path geometry is sampled once rather than measured during every animation frame.
function PathItem({
  children,
  index,
  count,
  progress,
  points,
}: {
  children: ReactNode;
  index: number;
  count: number;
  progress: MotionValue<number>;
  points: Point[];
}) {
  const transform = useTransform(progress, (value) => {
    const position = (((index / count - value) % 1) + 1) % 1;
    const sample = position * (points.length - 1);
    const first = Math.floor(sample);
    const next = Math.min(first + 1, points.length - 1);
    const fraction = sample - first;
    const x = points[first].x + (points[next].x - points[first].x) * fraction;
    const y = points[first].y + (points[next].y - points[first].y) * fraction;
    return `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
  });
  return (
    <motion.div className="path-marquee-item" style={{ transform }}>
      {children}
    </motion.div>
  );
}

export default function MarqueeAlongSvgPath({
  children,
  path,
  viewBox = "0 0 2400 240",
  baseVelocity = 32,
  repeat = 3,
  className = "",
}: Props) {
  const root = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [geometry, setGeometry] = useState<{
    points: Point[];
    width: number;
  } | null>(null);
  const progress = useMotionValue(0);
  const [reduce, setReduce] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const query = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduce(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  const items = Children.toArray(children);
  useEffect(() => {
    const el = root.current;
    const svgPath = pathRef.current;
    if (!el || !svgPath) return;
    const measure = () => {
      const width = Math.max(2400, el.clientWidth + 600);
      const [, , sourceWidth] = viewBox.split(" ").map(Number);
      const length = svgPath.getTotalLength();
      const points = Array.from({ length: 321 }, (_, i) => {
        const point = svgPath.getPointAtLength((length * i) / 320);
        return { x: (point.x / sourceWidth) * width - 300, y: point.y };
      });
      setGeometry({ points, width });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [path, viewBox]);
  useAnimationFrame((_, delta) => {
    if (reduce || !geometry) return;
    progress.set(
      (progress.get() +
        (baseVelocity * Math.min(delta, 64)) / 1000 / geometry.width) %
        1,
    );
  });
  const count =
    geometry && items.length
      ? items.length *
        Math.max(repeat, Math.floor(geometry.width / 285 / items.length))
      : 0;
  return (
    <div className={`path-marquee ${className}`} ref={root} aria-hidden="true">
      <svg className="path-marquee-measure" viewBox={viewBox} focusable="false">
        <path ref={pathRef} d={path} />
      </svg>
      {reduce || !geometry ? (
        <div className="path-marquee-static">{items}</div>
      ) : (
        Array.from({ length: count }, (_, index) => (
          <PathItem
            key={index}
            index={index}
            count={count}
            progress={progress}
            points={geometry.points}
          >
            {items[index % items.length]}
          </PathItem>
        ))
      )}
    </div>
  );
}
