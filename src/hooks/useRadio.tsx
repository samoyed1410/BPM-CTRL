import { useState, useEffect, useRef, useCallback } from "react";
import Hls from "hls.js";
import { analyze } from "web-audio-beat-detector";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface RadioTrack {
  id: string;
  title: string;
  artist: string;
  description: string;
  cover_image_url: string;
  audio_url: string;
  storage_path: string;
  duration_seconds: number;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type RadioMode = "off" | "prerecorded" | "live";

export interface RadioState {
  mode: RadioMode;
  streamUrl: string;
  liveTitle: string;
  liveDescription: string;
  liveImage: string;
}

const RADIO_DEFAULT_STATE: RadioState = {
  mode: "off",
  streamUrl: "",
  liveTitle: "",
  liveDescription: "",
  liveImage: "",
};

const RADIO_KEY_SORT_ORDER: Record<string, number> = {
  radio_mode: 0,
  radio_stream_url: 1,
  radio_live_title: 2,
  radio_live_description: 3,
  radio_live_image: 4,
};

const fetchRadioState = async (): Promise<RadioState> => {
  const { data, error } = await supabase
    .from("site_content")
    .select("content_key, content_value")
    .eq("section", "radio");

  if (error) throw error;

  const map: Record<string, string> = {};
  (data || []).forEach((row: any) => {
    map[row.content_key] = row.content_value;
  });

  return {
    mode: (map.radio_mode || "off") as RadioMode,
    streamUrl: map.radio_stream_url || "",
    liveTitle: map.radio_live_title || "",
    liveDescription: map.radio_live_description || "",
    liveImage: map.radio_live_image || "",
  };
};

const fetchRadioTracks = async (): Promise<RadioTrack[]> => {
  const { data, error } = await supabase
    .from("radio_tracks")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data || []) as RadioTrack[];
};

export const useRadioPlayer = () => {
  const queryClient = useQueryClient();

  const { data: radioState } = useQuery({
    queryKey: ["radioState"],
    queryFn: fetchRadioState,
  });

  const { data: tracks } = useQuery({
    queryKey: ["radioTracks"],
    queryFn: fetchRadioTracks,
  });

  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const channel = supabase
      .channel("radio-state")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "site_content", filter: "section=eq.radio" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["radioState"] });
        }
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "radio_tracks" }, () => {
        queryClient.invalidateQueries({ queryKey: ["radioTracks"] });
        queryClient.invalidateQueries({ queryKey: ["radioTracksAdmin"] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  useEffect(() => {
    if (!tracks?.length) {
      setCurrentTrackIndex(0);
      return;
    }

    setCurrentTrackIndex((index) => index % tracks.length);
  }, [tracks?.length]);

  const currentTrack = tracks && tracks.length > 0 ? tracks[currentTrackIndex % tracks.length] : null;

  const [bpm, setBpm] = useState<number | null>(null);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const hlsRef = useRef<Hls | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);

  const playNext = useCallback(() => {
    if (tracks && tracks.length > 0) {
      setCurrentTrackIndex((index) => (index + 1) % tracks.length);
    }
  }, [tracks]);

  const togglePlay = useCallback(() => {
    setIsPlaying((value) => !value);
  }, []);

  // Setup audio element + WebAudio graph (for waveform analyser)
  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.crossOrigin = "anonymous"; // best-effort; will silently fail if server doesn't allow
      audio.preload = "none";
      audioRef.current = audio;
      audio.addEventListener("ended", playNext);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener("ended", playNext);
      }
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
  }, [playNext]);

  const ensureAnalyser = useCallback(() => {
    if (!audioRef.current) return null;
    if (!audioCtxRef.current) {
      try {
        const Ctx = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new Ctx();
      } catch {
        return null;
      }
    }
    if (!analyserRef.current && audioCtxRef.current) {
      try {
        const analyser = audioCtxRef.current.createAnalyser();
        analyser.fftSize = 2048;
        const src = audioCtxRef.current.createMediaElementSource(audioRef.current);
        src.connect(analyser);
        analyser.connect(audioCtxRef.current.destination);
        analyserRef.current = analyser;
        sourceNodeRef.current = src;
      } catch {
        // Cross-origin streams without CORS headers will throw — fall back to silent analyser
        return null;
      }
    }
    return analyserRef.current;
  }, []);

  // Load source — supports MP3 and HLS (.m3u8)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Tear down any existing HLS instance
    hlsRef.current?.destroy();
    hlsRef.current = null;
    setStreamError(null);

    const loadSrc = (url: string) => {
      const isHls = /\.m3u8(\?|$)/i.test(url);
      if (isHls && Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(url);
        hls.attachMedia(audio);
        hls.on(Hls.Events.ERROR, (_e, data) => {
          if (data.fatal) {
            setStreamError(data.details || "Stream error");
            if (retryCount < 3) {
              setTimeout(() => setRetryCount((c) => c + 1), 2000);
            }
          }
        });
        hlsRef.current = hls;
      } else {
        audio.src = url;
      }
    };

    if (radioState?.mode === "live" && radioState.streamUrl) {
      loadSrc(radioState.streamUrl);
      if (isPlaying) audio.play().catch((e) => setStreamError(e.message));
      return;
    }

    if (radioState?.mode === "prerecorded" && currentTrack?.audio_url) {
      loadSrc(currentTrack.audio_url);
      if (isPlaying) audio.play().catch((e) => setStreamError(e.message));
      return;
    }

    audio.pause();
    audio.src = "";
    setIsPlaying(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [radioState?.mode, radioState?.streamUrl, currentTrack?.audio_url, retryCount]);

  // Play/pause handling
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audio.src && !hlsRef.current) return;

    if (isPlaying) {
      // Resume audio context if suspended (autoplay policy)
      if (audioCtxRef.current?.state === "suspended") {
        audioCtxRef.current.resume().catch(() => {});
      }
      audio.play().catch((err) => {
        setStreamError(err.message);
        setIsPlaying(false);
      });
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // BPM detection (prerecorded only — live streams can't be analysed)
  useEffect(() => {
    setBpm(null);
    if (radioState?.mode !== "prerecorded" || !currentTrack?.audio_url) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(currentTrack.audio_url);
        if (!res.ok) return;
        const buf = await res.arrayBuffer();
        const Ctx = window.OfflineAudioContext || (window as any).webkitOfflineAudioContext;
        const tmpCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const decoded = await tmpCtx.decodeAudioData(buf);
        const detected = await analyze(decoded);
        if (!cancelled && detected) setBpm(Math.round(detected));
        tmpCtx.close();
      } catch {
        // CORS / decode failure — silent
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [currentTrack?.audio_url, radioState?.mode]);

  return {
    radioState: radioState || RADIO_DEFAULT_STATE,
    tracks: tracks || [],
    currentTrack,
    currentTrackIndex,
    isPlaying,
    setIsPlaying,
    playNext,
    togglePlay,
    audioRef,
    bpm,
    streamError,
    ensureAnalyser,
  };
};

export const useAllRadioTracks = () =>
  useQuery({
    queryKey: ["radioTracksAdmin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("radio_tracks")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return (data || []) as RadioTrack[];
    },
  });

export const useCreateRadioTrack = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (track: Partial<RadioTrack>) => {
      const { error } = await supabase.from("radio_tracks").insert(track as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["radioTracksAdmin"] });
      queryClient.invalidateQueries({ queryKey: ["radioTracks"] });
    },
  });
};

export const useUpdateRadioTrack = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<RadioTrack> & { id: string }) => {
      const { error } = await supabase.from("radio_tracks").update(updates as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["radioTracksAdmin"] });
      queryClient.invalidateQueries({ queryKey: ["radioTracks"] });
    },
  });
};

export const useDeleteRadioTrack = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("radio_tracks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["radioTracksAdmin"] });
      queryClient.invalidateQueries({ queryKey: ["radioTracks"] });
    },
  });
};

const upsertRadioContent = async (key: string, value: string) => {
  const { data: existingRows, error: fetchError } = await supabase
    .from("site_content")
    .select("id")
    .eq("section", "radio")
    .eq("content_key", key)
    .limit(1);

  if (fetchError) throw fetchError;

  if (existingRows && existingRows.length > 0) {
    const { error } = await supabase
      .from("site_content")
      .update({ content_value: value, updated_at: new Date().toISOString() })
      .eq("id", existingRows[0].id);

    if (error) throw error;
    return;
  }

  const { error: insertError } = await supabase.from("site_content").insert({
    section: "radio",
    content_key: key,
    content_value: value,
    content_type: "text",
    sort_order: RADIO_KEY_SORT_ORDER[key] ?? 99,
    is_active: true,
  } as any);

  if (insertError) throw insertError;
};

export const useUpdateRadioState = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (state: Partial<RadioState>) => {
      const updates: Array<{ key: string; value: string }> = [];

      if (state.mode !== undefined) updates.push({ key: "radio_mode", value: state.mode });
      if (state.streamUrl !== undefined) updates.push({ key: "radio_stream_url", value: state.streamUrl });
      if (state.liveTitle !== undefined) updates.push({ key: "radio_live_title", value: state.liveTitle });
      if (state.liveDescription !== undefined) {
        updates.push({ key: "radio_live_description", value: state.liveDescription });
      }
      if (state.liveImage !== undefined) updates.push({ key: "radio_live_image", value: state.liveImage });

      for (const update of updates) {
        await upsertRadioContent(update.key, update.value);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["radioState"] });
    },
  });
};
