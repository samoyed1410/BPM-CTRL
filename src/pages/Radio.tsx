import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause, SkipForward, Radio as RadioIcon, AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import FrequencyWaves from "@/components/FrequencyWaves";
import WaveformVisualizer from "@/components/radio/WaveformVisualizer";
import DJGoLiveButton from "@/components/radio/DJGoLiveButton";
import DJSchedule from "@/components/radio/DJSchedule";
import { useRadioPlayer } from "@/hooks/useRadio";
import { Button } from "@/components/ui/button";

const Radio = () => {
  const {
    radioState,
    currentTrack,
    isPlaying,
    setIsPlaying,
    togglePlay,
    playNext,
    bpm,
    streamError,
    ensureAnalyser,
  } = useRadioPlayer();
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  const isLive = radioState.mode === "live";
  const isOff = radioState.mode === "off";
  const title = isLive ? radioState.liveTitle : currentTrack?.title || "Awaiting Signal";
  const subtitle = isLive ? radioState.liveDescription : currentTrack?.artist || "";
  const image = isLive ? radioState.liveImage : currentTrack?.cover_image_url;

  const handlePlay = () => {
    // First user gesture — initialize analyser
    const a = ensureAnalyser();
    if (a) setAnalyser(a);
    togglePlay();
  };

  // If already playing on mount, try to attach analyser
  useEffect(() => {
    if (isPlaying && !analyser) {
      const a = ensureAnalyser();
      if (a) setAnalyser(a);
    }
  }, [isPlaying, analyser, ensureAnalyser]);

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <Navbar />

      <div className="absolute inset-0 pointer-events-none">
        <FrequencyWaves />
      </div>

      <main className="relative z-10 pt-32 pb-24 px-4 max-w-6xl mx-auto">
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <span className="text-xs font-display tracking-[0.4em] text-primary uppercase">
            {isLive ? "🔴 ON AIR" : isOff ? "Off Air" : "Now Playing"}
          </span>
          <h1 className="font-display text-4xl md:text-6xl font-black gradient-text-orange mt-3">
            BPM CTRL RADIO
          </h1>
        </motion.header>

        {/* Visualizer Stage */}
        <div className="relative h-[500px] md:h-[560px] rounded-2xl border border-primary/30 bg-card/40 backdrop-blur-md overflow-hidden glow-border-orange">
          {/* Pulsing live overlay */}
          {isLive && (
            <motion.div
              animate={{ opacity: [0.15, 0.35, 0.15] }}
              transition={{ duration: 2.4, repeat: Infinity }}
              className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(circle at center, hsl(var(--destructive)/0.4), hsl(var(--primary)/0.2) 40%, transparent 70%)" }}
            />
          )}

          {/* Cover image backdrop */}
          {image && (
            <div
              className="absolute inset-0 opacity-20 bg-center bg-cover"
              style={{ backgroundImage: `url(${image})` }}
            />
          )}

          {/* Center content */}
          <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center">
            <motion.div
              animate={{ scale: isPlaying ? [1, 1.05, 1] : 1 }}
              transition={{ duration: 1.6, repeat: Infinity }}
              className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-primary/10 border border-primary/40 flex items-center justify-center mb-6 glow-box"
            >
              <RadioIcon className="w-12 h-12 md:w-16 md:h-16 text-primary" />
            </motion.div>

            <h2 className="font-display text-2xl md:text-4xl font-bold tracking-wider uppercase mb-2">
              {title}
            </h2>
            {subtitle && (
              <p className="text-muted-foreground font-body text-sm md:text-base mb-4">{subtitle}</p>
            )}

            {bpm && !isLive && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/40 bg-primary/10 mb-6"
              >
                <span className="font-display text-lg font-black text-primary">{bpm}</span>
                <span className="text-xs tracking-widest uppercase text-primary">BPM 🔥</span>
              </motion.div>
            )}

            {/* Waveform strip */}
            <div className="w-full max-w-2xl h-24 md:h-32 mb-6">
              <WaveformVisualizer analyser={analyser} isLive={isLive} isPlaying={isPlaying} />
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              <Button
                variant="neon"
                size="xl"
                onClick={handlePlay}
                disabled={isOff}
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                {isPlaying ? "Pause" : "Tune In"}
              </Button>
              {!isLive && (
                <Button variant="portal" size="xl" onClick={playNext} aria-label="Next track">
                  <SkipForward className="w-5 h-5" />
                  Next
                </Button>
              )}
            </div>

            {streamError && (
              <div className="mt-4 flex items-center gap-2 text-xs text-destructive">
                <AlertCircle className="w-3 h-3" />
                <span>{streamError}. Retrying...</span>
              </div>
            )}

            {isOff && (
              <p className="mt-6 text-sm text-muted-foreground font-display tracking-widest uppercase">
                Signal silent — check back soon
              </p>
            )}
          </div>
        </div>

        {/* Schedule */}
        <div className="grid md:grid-cols-2 gap-6 mt-10">
          <DJSchedule />
          <div className="rounded-xl border border-primary/20 bg-card/50 backdrop-blur-sm p-6">
            <h3 className="font-display tracking-[0.3em] text-sm uppercase text-primary mb-3">
              About the Signal
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              BPM CTRL Radio is a 24/7 broadcast of Afro House and underground electronic
              transmissions from Lagos and beyond. Tune in for live DJ sets, curated mixes,
              and crowd moments straight from the floor.
            </p>
          </div>
        </div>
      </main>

      <DJGoLiveButton />
    </div>
  );
};

export default Radio;
