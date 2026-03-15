import { useState, useEffect, useRef, useCallback } from "react";
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

  const playNext = useCallback(() => {
    if (tracks && tracks.length > 0) {
      setCurrentTrackIndex((index) => (index + 1) % tracks.length);
    }
  }, [tracks]);

  const togglePlay = useCallback(() => {
    setIsPlaying((value) => !value);
  }, []);

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
  }, [playNext]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (radioState?.mode === "live" && radioState.streamUrl) {
      audio.src = radioState.streamUrl;
      if (isPlaying) audio.play().catch(() => {});
      return;
    }

    if (radioState?.mode === "prerecorded" && currentTrack?.audio_url) {
      audio.src = currentTrack.audio_url;
      if (isPlaying) audio.play().catch(() => {});
      return;
    }

    audio.pause();
    audio.src = "";
    setIsPlaying(false);
  }, [radioState?.mode, radioState?.streamUrl, currentTrack?.audio_url, isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audio.src) return;

    if (isPlaying) {
      audio.play().catch(() => {
        setIsPlaying(false);
      });
    } else {
      audio.pause();
    }
  }, [isPlaying]);

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
