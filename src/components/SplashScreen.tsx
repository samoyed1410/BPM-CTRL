import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [phase, setPhase] = useState<"logo" | "exit">("logo");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("exit"), 1800);
    const t2 = setTimeout(onComplete, 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== "exit" ? null : null}
      <motion.div
        key="splash"
        initial={{ opacity: 1 }}
        animate={phase === "exit" ? { opacity: 0 } : { opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center"
        role="status"
        aria-live="polite"
        aria-label="Loading BPM CTRL"
      >
        {/* Radial glow */}
        <div className="absolute w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px] animate-pulse-glow" aria-hidden="true" />

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 text-center"
        >
          <div className="w-3 h-3 rounded-full bg-primary mx-auto mb-6 animate-pulse-glow" aria-hidden="true" />
          <h1 className="font-display text-5xl md:text-7xl font-black gradient-text-orange text-glow-orange tracking-tight">
            BPM CTRL
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-xs font-display tracking-[0.4em] text-primary uppercase mt-4"
          >
            Initializing Signal...
          </motion.p>
        </motion.div>

        {/* Loading bar */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "160px" }}
          transition={{ duration: 1.6, ease: "easeInOut", delay: 0.3 }}
          className="h-0.5 rounded-full gradient-bg-orange mt-8 relative z-10"
          style={{ boxShadow: "0 0 15px hsl(22 100% 55% / 0.5)" }}
          role="progressbar"
          aria-label="Loading progress"
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default SplashScreen;
