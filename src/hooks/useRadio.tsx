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

// Fetch radio state from site_content
const fetchRadioState = async (): Promise<RadioState> => {
  const { data } = await supabase
    .from("site_content")
    .select("*")
    .eq("section", "radio");
  const map: Record<string, string> = {};
  (data || []).forEach((r: any) => { map[r.content_key] = r.content_value; });
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
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data || []) as RadioTrack[];
};

// Public hook for listening to radio
export const useRadioPlayer = () => {
  const queryClient = useQueryClient();
  const { data: radioState } = useQuery({ queryKey: ["radioState"], queryFn: fetchRadioState });
  const { data: tracks } = useQuery({ queryKey: ["radioTracks"], queryFn: fetchRadioTracks });

  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Subscribe to realtime changes on site_content (radio section)
  useEffect(() => {
    const channel = supabase
      .channel("radio-state")
      .on("postgres_changes", { event: "*", schema: "public", table: "site_content", filter: "section=eq.radio" }, () => {
        queryClient.invalidateQueries({ queryKey: ["radioState"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "radio_tracks" }, () => {
        queryClient.invalidateQueries({ queryKey: ["radioTracks"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const currentTrack = tracks && tracks.length > 0 ? tracks[currentTrackIndex % tracks.length] : null;

  const playNext = useCallback(() => {
    if (tracks && tracks.length > 0) {
      setCurrentTrackIndex((i) => (i + 1) % tracks.length);
    }
  }, [tracks]);

  const togglePlay = useCallback(() => {
    setIsPlaying((p) => !p);
  }, []);

  return {
    radioState: radioState || { mode: "off" as RadioMode, streamUrl: "", liveTitle: "", liveDescription: "", liveImage: "" },
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

// Admin hooks
export const useAllRadioTracks = () =>
  useQuery({
    queryKey: ["radioTracksAdmin"],
    queryFn: async () => {
      const { data, error } = await supabase.from("radio_tracks").select("*").order("sort_order", { ascending: true });
      if (error) throw error;
      return (data || []) as RadioTrack[];
    },
  });

export const useCreateRadioTrack = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (track: Partial<RadioTrack>) => {
      const { error } = await supabase.from("radio_tracks").insert(track as any);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["radioTracksAdmin"] }),
  });
};

export const useUpdateRadioTrack = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<RadioTrack> & { id: string }) => {
      const { error } = await supabase.from("radio_tracks").update(updates as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["radioTracksAdmin"] }),
  });
};

export const useDeleteRadioTrack = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("radio_tracks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["radioTracksAdmin"] }),
  });
};

export const useUpdateRadioState = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (state: Partial<RadioState>) => {
      const updates: { key: string; value: string }[] = [];
      if (state.mode !== undefined) updates.push({ key: "radio_mode", value: state.mode });
      if (state.streamUrl !== undefined) updates.push({ key: "radio_stream_url", value: state.streamUrl });
      if (state.liveTitle !== undefined) updates.push({ key: "radio_live_title", value: state.liveTitle });
      if (state.liveDescription !== undefined) updates.push({ key: "radio_live_description", value: state.liveDescription });
      if (state.liveImage !== undefined) updates.push({ key: "radio_live_image", value: state.liveImage });
      for (const u of updates) {
        const { error } = await supabase
          .from("site_content")
          .update({ content_value: u.value })
          .eq("section", "radio")
          .eq("content_key", u.key);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["radioState"] }),
  });
};
