import { ReactNode } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  /** animation distance in px (default 30) */
  offset?: number;
}

export default function ScrollReveal({
  children,
  className = "",
  offset = 30,
}: ScrollRevealProps) {
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  if (inView) {
    controls.start({ opacity: 1, y: 0, transition: { duration: 0.6 } });
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: offset }}
      animate={controls}
      className={className}
    >
      {children}
    </motion.div>
  );
}

