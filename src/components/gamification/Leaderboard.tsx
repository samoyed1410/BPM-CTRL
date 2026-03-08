import { motion } from "framer-motion";
import { Trophy } from "lucide-react";

interface LeaderboardProps {
  userAlias: string;
  userXp: number;
}

const MOCK_USERS = [
  { name: "SPECTR4L", level: "Rhythm Controller", xp: 620 },
  { name: "N1GHT.WAV", level: "Pulse Rider", xp: 445 },
  { name: "FREQ.GHOST", level: "Pulse Rider", xp: 380 },
  { name: "BASS.UNIT", level: "Frequency Walker", xp: 210 },
];

const Leaderboard = ({ userAlias, userXp }: LeaderboardProps) => {
  const allUsers = [
    ...MOCK_USERS,
    { name: userAlias.toUpperCase(), level: "Signal Receiver", xp: userXp, isUser: true as const },
  ].sort((a, b) => b.xp - a.xp);

  return (
    <div className="glow-border-orange rounded-2xl bg-card p-6 md:p-8 relative overflow-hidden">
      <div className="scanline absolute inset-0 pointer-events-none opacity-10 rounded-2xl" />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-6">
          <Trophy className="w-4 h-4 text-primary" />
          <h4 className="font-display text-sm tracking-[0.3em] text-primary uppercase">Community Leaderboard</h4>
        </div>
        <div className="space-y-0">
          {allUsers.map((user, i) => {
            const isUser = "isUser" in user;
            return (
              <motion.div
                key={user.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i }}
                className={`flex items-center justify-between py-3 ${
                  i > 0 ? "border-t border-border" : ""
                } ${isUser ? "bg-primary/5 -mx-3 px-3 rounded-lg" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-display w-6 ${
                    i === 0 ? "text-orange-amber" : i === 1 ? "text-muted-foreground" : "text-muted-foreground"
                  }`}>
                    #{i + 1}
                  </span>
                  <span className={`text-sm font-body ${isUser ? "text-primary font-semibold" : "text-foreground"}`}>
                    {user.name}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-display tracking-wider text-muted-foreground hidden sm:block">
                    {user.level}
                  </span>
                  <span className={`text-xs font-display tracking-wider ${isUser ? "text-primary" : "text-muted-foreground"}`}>
                    {user.xp} XP
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
