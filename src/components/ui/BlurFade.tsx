import { motion } from "motion/react";
import { cn } from "@/lib/cn";

export function BlurFade({
  children,
  delay = 0,
  className,
  y = 10,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  y?: number;
}) {
  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0, filter: "blur(10px)", y }}
      animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
