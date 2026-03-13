import { useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Radio, Pause, Play, SkipForward, Volume2 } from "lucide-react";
import { useRadioPlayer } from "@/hooks/useRadio";

const TransmissionTicker = () => {
  const {
    radioState,
    currentTrack,
    isPlaying,
    setIsPlaying,
    playNext,
    togglePlay,
    audioRef,
    tracks,
  } = useRadioPlayer();

  // Handle audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.addEventListener("ended", playNext);
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener("ended", playNext);
      }
    };
  }, [playNext, audioRef]);

  // Update audio source based on mode
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (radioState.mode === "live" && radioState.streamUrl) {
      audio.src = radioState.streamUrl;
      if (isPlaying) audio.play().catch(() => {});
    } else if (radioState.mode === "prerecorded" && currentTrack) {
      audio.src = currentTrack.audio_url;
      if (isPlaying) audio.play().catch(() => {});
    } else {
      audio.pause();
      audio.src = "";
    }
  }, [radioState.mode, radioState.streamUrl, currentTrack, audioRef]);

  // Handle play/pause state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audio.src) return;
    if (isPlaying) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [isPlaying, audioRef]);

  if (radioState.mode === "off") return null;

  const isLive = radioState.mode === "live";
  const title = isLive ? radioState.liveTitle : currentTrack?.title || "";
  const description = isLive ? radioState.liveDescription : currentTrack?.description || "";
  const artist = isLive ? "" : currentTrack?.artist || "";
  const image = isLive ? radioState.liveImage : currentTrack?.cover_image_url || "";

  if (!title) return null;

  const tickerContent = isLive
    ? `🔴 LIVE — ${title}${description ? ` — ${description}` : ""}`
    : `📡 NOW PLAYING — ${title}${artist ? ` by ${artist}` : ""}${description ? ` — ${description}` : ""}`;

  return (
    <div className="fixed top-[53px] left-0 right-0 z-40 bg-card/90 backdrop-blur-md border-b border-primary/20 overflow-hidden">
      <div className="flex items-center h-10">
        {/* Controls */}
        <div className="flex items-center gap-1 px-3 border-r border-border shrink-0">
          {isLive && (
            <span className="w-2 h-2 rounded-full bg-destructive animate-pulse mr-1.5" />
          )}
          <button
            onClick={togglePlay}
            className="p-1 text-primary hover:text-primary/80 transition-colors"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          {!isLive && tracks.length > 1 && (
            <button
              onClick={playNext}
              className="p-1 text-muted-foreground hover:text-primary transition-colors"
              aria-label="Next track"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          )}
          <Volume2 className="w-3 h-3 text-muted-foreground ml-1" />
        </div>

        {/* Image thumbnail */}
        {image && (
          <div className="shrink-0 px-2">
            <img src={image} alt="" className="w-7 h-7 rounded object-cover" />
          </div>
        )}

        {/* Scrolling ticker */}
        <div className="flex-1 overflow-hidden relative">
          <motion.div
            className="flex whitespace-nowrap"
            animate={{ x: [0, -1000] }}
            transition={{ x: { repeat: Infinity, repeatType: "loop", duration: 20, ease: "linear" } }}
          >
            <span className="font-display text-xs tracking-wider text-primary/90 px-8">
              {tickerContent}
            </span>
            <span className="font-display text-xs tracking-wider text-primary/90 px-8">
              {tickerContent}
            </span>
            <span className="font-display text-xs tracking-wider text-primary/90 px-8">
              {tickerContent}
            </span>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TransmissionTicker;
