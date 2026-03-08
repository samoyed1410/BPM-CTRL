import { useState } from "react";
import { motion } from "framer-motion";
import { Radio, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const EmailSignup = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast({ title: "Invalid email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }
    // In production, this would POST to a backend/newsletter API
    setSubmitted(true);
    toast({ title: "Signal received", description: "You're now on the BPM CTRL frequency." });
  };

  return (
    <section className="py-20 px-4 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-orange-deep/5 to-background" />
      <div className="max-w-2xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glow-border-orange rounded-2xl bg-card p-8 md:p-12 text-center relative overflow-hidden"
        >
          <div className="scanline absolute inset-0 pointer-events-none opacity-15 rounded-2xl" />
          <div className="relative z-10">
            <Radio className="w-6 h-6 text-primary mx-auto mb-4 animate-pulse-glow" />
            <h3 className="font-display text-2xl md:text-3xl font-black text-foreground text-glow-orange mb-2">
              STAY ON THE FREQUENCY
            </h3>
            <p className="text-muted-foreground font-body text-sm mb-8 max-w-md mx-auto">
              Get early event access, secret drops, and community updates. No spam — only signal.
            </p>

            {!submitted ? (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  maxLength={255}
                  className="flex-1 bg-muted border border-border rounded-lg px-4 py-3 text-foreground font-body placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-all"
                />
                <Button variant="neon" size="lg" type="submit">
                  Join Signal
                </Button>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-center gap-3 py-3 px-6 rounded-lg bg-primary/10 border border-primary/30"
              >
                <Check className="w-5 h-5 text-primary" />
                <span className="font-display text-sm tracking-wider text-primary uppercase">
                  Signal Locked In
                </span>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default EmailSignup;
