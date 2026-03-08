import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap } from "lucide-react";
import SignalAliasInput from "./gamification/SignalAliasInput";
import ProfileCard from "./gamification/ProfileCard";
import BadgeGrid from "./gamification/BadgeGrid";
import LevelProgress, { LEVELS } from "./gamification/LevelProgress";
import NetworkStatus from "./gamification/NetworkStatus";
import SecretAccess from "./gamification/SecretAccess";
import Leaderboard from "./gamification/Leaderboard";

const CITIES = ["Lagos", "Abuja", "Ibadan", "Port Harcourt", "Accra", "Nairobi", "London", "Berlin"];

const GamificationSection = () => {
  const [alias, setAlias] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [xp, setXp] = useState(0);
  const [showSecret, setShowSecret] = useState(false);
  const [badgeUnlocked, setBadgeUnlocked] = useState(false);
  const [location] = useState(() => CITIES[Math.floor(Math.random() * CITIES.length)]);

  const handleSubmit = (newAlias: string) => {
    setAlias(newAlias);
    setSubmitted(true);
    setXp(50);

    setTimeout(() => {
      setBadgeUnlocked(true);
      setCurrentLevel(1);
      setXp(120);
    }, 1500);

    setTimeout(() => {
      setShowSecret(true);
    }, 3500);
  };

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
          <SignalAliasInput onSubmit={handleSubmit} />
        ) : (
          <div className="space-y-6">
            {/* Badge unlock notification */}
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

            {/* Profile + Network Status row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ProfileCard
                alias={alias}
                level={LEVELS[currentLevel]}
                levelIndex={currentLevel}
                location={location}
              />
              <NetworkStatus />
            </div>

            {/* Level Progress */}
            <LevelProgress currentLevel={currentLevel} xp={xp} />

            {/* Badges */}
            <BadgeGrid unlockedCount={badgeUnlocked ? 1 : 0} />

            {/* Leaderboard */}
            <Leaderboard userAlias={alias} userXp={xp} />

            {/* Secret Access */}
            <AnimatePresence>
              {showSecret && <SecretAccess />}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
};

export default GamificationSection;
