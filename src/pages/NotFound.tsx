import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Radio, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import FrequencyWaves from "@/components/FrequencyWaves";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
      <div className="absolute inset-0 opacity-10">
        <FrequencyWaves />
      </div>
      <div className="scanline absolute inset-0 pointer-events-none opacity-10" />

      <div className="relative z-10 text-center px-6 max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Radio className="w-10 h-10 text-primary mx-auto mb-6 animate-pulse-glow" />

          <h1 className="font-display text-7xl md:text-9xl font-black text-foreground text-glow-orange mb-2 tracking-tighter">
            404
          </h1>

          <p className="font-display text-lg md:text-xl tracking-[0.2em] uppercase text-primary mb-4">
            Signal Lost
          </p>

          <p className="text-muted-foreground font-body text-sm mb-10 max-w-sm mx-auto">
            This frequency doesn't exist. The signal you're looking for has either moved or was never transmitted.
          </p>

          <Link to="/">
            <Button variant="neon" size="lg" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Return to Frequency
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
