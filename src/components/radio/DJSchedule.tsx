import { motion } from "framer-motion";
import { Calendar, Clock } from "lucide-react";

// TODO (Supabase schema suggestion):
// CREATE TABLE public.dj_schedule (
//   id uuid PK default gen_random_uuid(),
//   dj_name text NOT NULL,
//   show_title text NOT NULL,
//   starts_at timestamptz NOT NULL,
//   ends_at timestamptz,
//   cover_url text,
//   created_at timestamptz default now()
// );
// GRANT SELECT ON public.dj_schedule TO anon, authenticated;
// GRANT ALL ON public.dj_schedule TO service_role;
// ALTER TABLE public.dj_schedule ENABLE ROW LEVEL SECURITY;
// CREATE POLICY "schedule public read" ON public.dj_schedule FOR SELECT USING (true);
// CREATE POLICY "admin manage schedule" ON public.dj_schedule FOR ALL TO authenticated
//   USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

const upcoming = [
  { dj: "DJ ÌFÉ", show: "Afro Frequency 004", when: "FRI · 22:00 WAT" },
  { dj: "SOUND ARCHITECT", show: "Underground Pulse", when: "SAT · 23:00 WAT" },
  { dj: "BODY SIGNAL", show: "Body Signal Late Night", when: "SUN · 01:00 WAT" },
];

const DJSchedule = () => (
  <div className="rounded-xl border border-primary/20 bg-card/50 backdrop-blur-sm p-6">
    <div className="flex items-center gap-2 mb-4">
      <Calendar className="w-4 h-4 text-primary" />
      <h3 className="font-display tracking-[0.3em] text-sm uppercase text-primary">Upcoming Transmissions</h3>
    </div>
    <ul className="space-y-3">
      {upcoming.map((s, i) => (
        <motion.li
          key={s.show}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08 }}
          className="flex items-center justify-between gap-4 p-3 rounded-lg bg-background/40 border border-border/50 hover:border-primary/40 transition-colors"
        >
          <div className="min-w-0">
            <div className="text-sm font-display tracking-wider truncate">{s.show}</div>
            <div className="text-xs text-muted-foreground truncate">{s.dj}</div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-primary shrink-0 font-display tracking-wider">
            <Clock className="w-3 h-3" />
            {s.when}
          </div>
        </motion.li>
      ))}
    </ul>
  </div>
);

export default DJSchedule;
