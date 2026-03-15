import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap } from "lucide-react";
import SignalAliasInput from "./gamification/SignalAliasInput";
import ProfileCard from "./gamification/ProfileCard";
import BadgeGrid from "./gamification/BadgeGrid";
import LevelProgress, { LEVELS } from "./gamification/LevelProgress";
import NetworkStatus from "./gamification/NetworkStatus";
import SecretAccess from "./gamification/SecretAccess";
import Leaderboard from "./gamification/Leaderboard";
import { useToast } from "@/hooks/use-toast";
import { useSignalLeaderboard, useSubmitSignalAlias } from "@/hooks/useSignalNetwork";

const CITIES = ["Lagos", "Abuja", "Ibadan", "Port Harcourt", "Accra", "Nairobi", "London", "Berlin"];
const SIGNAL_STORAGE_KEY = "bpmctrl_signal_identity";

const getLevelFromXp = (xp: number) => {
  let level = 0;
  for (let i = LEVELS.length - 1; i >= 0; i -= 1) {
    if (xp >= LEVELS[i].xpNeeded) {
      level = i;
      break;
    }
  }
  return level;
};

const GamificationSection = () => {
  const { toast } = useToast();
  const { data: leaderboard = [] } = useSignalLeaderboard();
  const submitAlias = useSubmitSignalAlias();

  const [alias, setAlias] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [xp, setXp] = useState(0);
  const [showSecret, setShowSecret] = useState(false);
  const [badgeUnlocked, setBadgeUnlocked] = useState(false);
  const [location] = useState(() => CITIES[Math.floor(Math.random() * CITIES.length)]);

  useEffect(() => {
    const storedRaw = localStorage.getItem(SIGNAL_STORAGE_KEY);
    if (!storedRaw) return;

    try {
      const stored = JSON.parse(storedRaw) as { alias: string; xp: number };
      if (!stored.alias) return;
      setAlias(stored.alias);
      setXp(stored.xp || 0);
      setCurrentLevel(getLevelFromXp(stored.xp || 0));
      setSubmitted(true);
      setBadgeUnlocked((stored.xp || 0) >= 100);
      setShowSecret((stored.xp || 0) >= 100);
    } catch {
      localStorage.removeItem(SIGNAL_STORAGE_KEY);
    }
  }, []);

  const handleSubmit = useCallback(
    async (newAlias: string) => {
      try {
        const result = await submitAlias.mutateAsync(newAlias);

        setAlias(result.alias);
        setSubmitted(true);
        setXp(result.xp);

        const level = getLevelFromXp(result.xp);
        setCurrentLevel(level);

        localStorage.setItem(
          SIGNAL_STORAGE_KEY,
          JSON.stringify({ alias: result.alias, xp: result.xp })
        );

        setBadgeUnlocked(false);
        setShowSecret(false);

        setTimeout(() => {
          setBadgeUnlocked(result.xp >= 100);
        }, 700);

        setTimeout(() => {
          setShowSecret(result.xp >= 100);
        }, 1800);
      } catch (err: any) {
        toast({
          title: "Signal activation failed",
          description: err.message || "Please try again.",
          variant: "destructive",
        });
      }
    },
    [submitAlias, toast]
  );

  const leaderboardEntries = useMemo(
    () => leaderboard.map((entry) => ({ alias: entry.alias, xp: entry.xp })),
    [leaderboard]
  );

  return (
    <section id="signal" className="py-24 px-4 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-orange-deep/5 to-background" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px]" />

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-4"
        >
          <span className="text-xs font-display tracking-[0.4em] text-primary uppercase">Interactive Protocol</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-center font-display text-4xl md:text-6xl font-black gradient-text-orange mb-16"
        >
          JOIN THE SIGNAL NETWORK
        </motion.h2>

        {!submitted ? (
          <SignalAliasInput onSubmit={handleSubmit} loading={submitAlias.isPending} />
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {badgeUnlocked && (
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="flex items-center justify-center gap-3 py-3 px-6 rounded-lg bg-primary/10 border border-primary/30 glow-box"
                >
                  <Zap className="w-5 h-5 text-primary" />
                  <span className="font-display text-sm tracking-wider text-primary uppercase">
                    Badge Unlocked: First Transmission
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ProfileCard
                alias={alias}
                level={LEVELS[currentLevel]}
                levelIndex={currentLevel}
                location={location}
              />
              <NetworkStatus />
            </div>

            <LevelProgress currentLevel={currentLevel} xp={xp} />

            <BadgeGrid unlockedCount={badgeUnlocked ? 1 : 0} />

            <Leaderboard userAlias={alias} userXp={xp} entries={leaderboardEntries} />

            <AnimatePresence>{showSecret && <SecretAccess />}</AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
};

export default GamificationSection;
