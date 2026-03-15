import { motion } from "framer-motion";
import { Trophy } from "lucide-react";

interface LeaderboardProps {
  userAlias: string;
  userXp: number;
  entries?: Array<{ alias: string; xp: number }>;
}

const MOCK_USERS = [
  { alias: "SPECTR4L", xp: 620 },
  { alias: "N1GHT.WAV", xp: 445 },
  { alias: "FREQ.GHOST", xp: 380 },
  { alias: "BASS.UNIT", xp: 210 },
];

const getRankTitle = (xp: number) => {
  if (xp >= 1000) return "Bass Architect";
  if (xp >= 600) return "Rhythm Controller";
  if (xp >= 300) return "Pulse Rider";
  if (xp >= 100) return "Frequency Walker";
  return "Signal Receiver";
};

const Leaderboard = ({ userAlias, userXp, entries = [] }: LeaderboardProps) => {
  const sourceEntries = entries.length
    ? entries.map((entry) => ({ alias: entry.alias.toUpperCase(), xp: entry.xp }))
    : MOCK_USERS;

  const hasUserInBoard = sourceEntries.some((entry) => entry.alias === userAlias.toUpperCase());

  const allUsers = [
    ...sourceEntries,
    ...(!hasUserInBoard && userAlias ? [{ alias: userAlias.toUpperCase(), xp: userXp, isUser: true as const }] : []),
  ]
    .map((entry) => ({ ...entry, isUser: "isUser" in entry ? entry.isUser : entry.alias === userAlias.toUpperCase() }))
    .sort((a, b) => b.xp - a.xp)
    .slice(0, 10);

  return (
    <div className="glow-border-orange rounded-2xl bg-card p-6 md:p-8 relative overflow-hidden">
      <div className="scanline absolute inset-0 pointer-events-none opacity-10 rounded-2xl" />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-6">
          <Trophy className="w-4 h-4 text-primary" />
          <h4 className="font-display text-sm tracking-[0.3em] text-primary uppercase">Community Leaderboard</h4>
        </div>
        <div className="space-y-0">
          {allUsers.map((user, i) => (
            <motion.div
              key={`${user.alias}-${i}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.08 * i }}
              className={`flex items-center justify-between py-3 ${
                i > 0 ? "border-t border-border" : ""
              } ${user.isUser ? "bg-primary/5 -mx-3 px-3 rounded-lg" : ""}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-display w-6 text-muted-foreground">#{i + 1}</span>
                <span className={`text-sm font-body ${user.isUser ? "text-primary font-semibold" : "text-foreground"}`}>
                  {user.alias}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-display tracking-wider text-muted-foreground hidden sm:block">
                  {getRankTitle(user.xp)}
                </span>
                <span className={`text-xs font-display tracking-wider ${user.isUser ? "text-primary" : "text-muted-foreground"}`}>
                  {user.xp} XP
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
