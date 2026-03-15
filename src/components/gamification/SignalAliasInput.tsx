import { useState } from "react";
import { motion } from "framer-motion";
import { Radio } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SignalAliasInputProps {
  onSubmit: (alias: string) => Promise<void> | void;
  loading?: boolean;
}

const SignalAliasInput = ({ onSubmit, loading = false }: SignalAliasInputProps) => {
  const [alias, setAlias] = useState("");
  const [error, setError] = useState("");

  const validateAlias = (value: string) => {
    const trimmed = value.trim();
    if (trimmed.length < 3 || trimmed.length > 32) {
      return "Alias must be 3-32 characters.";
    }
    if (!/^[A-Za-z0-9 _.-]+$/.test(trimmed)) {
      return "Use letters, numbers, spaces, dots, dashes, or underscores only.";
    }
    return "";
  };

  const handleSubmit = async () => {
    const trimmed = alias.trim();
    const validationError = validateAlias(trimmed);

    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    await onSubmit(trimmed);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="glow-border-orange rounded-2xl bg-card p-8 md:p-12 relative overflow-hidden"
    >
      <div className="scanline absolute inset-0 pointer-events-none opacity-20 rounded-2xl" />
      <div className="relative z-10 text-center">
        <Radio className="w-8 h-8 text-primary mx-auto mb-4 animate-pulse-glow" />
        <h3 className="font-display text-xl md:text-2xl font-bold text-foreground text-glow-orange mb-2">
          INITIALIZE YOUR SIGNAL
        </h3>
        <p className="text-muted-foreground font-body mb-8 max-w-md mx-auto">
          Enter your rave identity to join the BPM CTRL signal network. Your alias is your frequency.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="text"
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Enter your rave identity..."
            maxLength={32}
            className="flex-1 bg-muted border border-border rounded-lg px-4 py-3 text-foreground font-body placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-all"
          />
          <Button variant="neon" size="lg" onClick={handleSubmit} disabled={loading}>
            {loading ? "Activating..." : "Activate Signal"}
          </Button>
        </div>
        {error && <p className="mt-3 text-xs font-body text-destructive">{error}</p>}
      </div>
    </motion.div>
  );
};

export default SignalAliasInput;
