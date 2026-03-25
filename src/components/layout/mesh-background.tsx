"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

export function MeshBackground() {
  const [mounted, setMounted] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  const translateX = useTransform(springX, (value) => value * -0.05);
  const translateY = useTransform(springY, (value) => value * -0.05);

  useEffect(() => {
    setMounted(true);
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - window.innerWidth / 2);
      mouseY.set(e.clientY - window.innerHeight / 2);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none select-none">
      <motion.div 
        style={{ x: translateX, y: translateY }}
        className="relative h-full w-full"
      >
        <div 
          className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] opacity-100"
          style={{ 
            background: "radial-gradient(circle, var(--mesh-glow-1) 0%, transparent 70%)" 
          }}
        />

        <div 
          className="absolute top-[20%] left-[-15%] w-[70%] h-[70%] rounded-full blur-[140px] opacity-100"
          style={{ 
            background: "radial-gradient(circle, var(--mesh-glow-2, transparent) 0%, transparent 70%)" 
          }}
        />

        <div 
          className="absolute bottom-[-20%] right-[10%] w-[80%] h-[80%] rounded-full blur-[160px] opacity-100"
          style={{ 
            background: "radial-gradient(circle, var(--mesh-glow-1) 0%, transparent 70%)" 
          }}
        />

        <div 
          className="absolute inset-0 flex items-center justify-center opacity-100 dark:hidden"
          style={{ 
            background: "radial-gradient(circle, rgba(255,255,255,0.6) 0%, transparent 80%)" 
          }}
        />
      </motion.div>
    </div>
  );
}
