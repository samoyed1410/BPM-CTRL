import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Users, Globe, Clock } from "lucide-react";
import { useSectionContent, getContentValue } from "@/hooks/useSiteContent";

const useCountdown = (target: Date) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, target.getTime() - Date.now());
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        mins: Math.floor((diff % 3600000) / 60000),
        secs: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  return timeLeft;
};

const useFluctuatingNumber = (base: number, range: number) => {
  const [value, setValue] = useState(base);
  useEffect(() => {
    setValue(base + Math.floor(Math.random() * range) - Math.floor(range / 2));
    const id = setInterval(() => {
      setValue(base + Math.floor(Math.random() * range) - Math.floor(range / 2));
    }, 3000);
    return () => clearInterval(id);
  }, [base, range]);
  return value;
};

const NetworkStatus = () => {
  const { data: content } = useSectionContent("gamification");

  const agentsBase = parseInt(getContentValue(content, "agents_online_base", "247")) || 247;
  const membersBase = parseInt(getContentValue(content, "total_members_base", "1842")) || 1842;
  const countdownDateStr = getContentValue(content, "countdown_date", "2026-06-01T22:00:00");
  const countdownLabel = getContentValue(content, "countdown_label", "Next Frequency Drop");

  const targetDate = useMemo(() => new Date(countdownDateStr), [countdownDateStr]);
  const countdown = useCountdown(targetDate);
  const agentsOnline = useFluctuatingNumber(agentsBase, 40);
  const totalMembers = useFluctuatingNumber(membersBase, 10);

  return (
    <div className="glow-border-orange rounded-2xl bg-card p-6 md:p-8 relative overflow-hidden">
      <div className="scanline absolute inset-0 pointer-events-none opacity-10 rounded-2xl" />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
          <h4 className="font-display text-sm tracking-[0.3em] text-primary uppercase">Signal Network Status</h4>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="rounded-xl bg-muted/50 border border-border p-4">
            <Users className="w-5 h-5 text-primary mb-2" />
            <p className="font-display text-2xl font-black text-foreground text-glow-orange">{agentsOnline}</p>
            <p className="text-[10px] font-display tracking-wider text-muted-foreground uppercase mt-1">Agents Online</p>
          </div>
          <div className="rounded-xl bg-muted/50 border border-border p-4">
            <Globe className="w-5 h-5 text-orange-amber mb-2" />
            <p className="font-display text-2xl font-black text-foreground">{totalMembers.toLocaleString()}</p>
            <p className="text-[10px] font-display tracking-wider text-muted-foreground uppercase mt-1">Total Members</p>
          </div>
        </div>

        {/* Countdown */}
        <div className="rounded-xl bg-muted/30 border border-border p-5 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-primary" />
            <p className="text-[10px] font-display tracking-[0.3em] text-muted-foreground uppercase">
              {countdownLabel}
            </p>
          </div>
          <div className="flex justify-center gap-4 md:gap-6">
            {[
              { value: countdown.days, label: "Days" },
              { value: countdown.hours, label: "Hrs" },
              { value: countdown.mins, label: "Min" },
              { value: countdown.secs, label: "Sec" },
            ].map((unit) => (
              <div key={unit.label}>
                <motion.p
                  key={unit.value}
                  initial={{ opacity: 0.5, y: -2 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="font-display text-2xl md:text-4xl font-black text-foreground text-glow-orange"
                >
                  {String(unit.value).padStart(2, "0")}
                </motion.p>
                <p className="text-[10px] font-display tracking-wider text-muted-foreground uppercase mt-1">
                  {unit.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkStatus;
