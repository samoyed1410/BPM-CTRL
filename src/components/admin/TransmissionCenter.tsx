import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Plus, Edit, Eye, EyeOff, Radio, Music, Upload, Save } from "lucide-react";
import { uploadAssetFile } from "@/hooks/useSiteAssets";
import {
  useAllRadioTracks,
  useCreateRadioTrack,
  useUpdateRadioTrack,
  useDeleteRadioTrack,
  useUpdateRadioState,
  type RadioTrack,
  type RadioMode,
} from "@/hooks/useRadio";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const TransmissionCenter = () => {
  const { toast } = useToast();
  const { data: tracks, isLoading } = useAllRadioTracks();
  const createTrack = useCreateRadioTrack();
  const updateTrack = useUpdateRadioTrack();
  const deleteTrack = useDeleteRadioTrack();
  const updateRadioState = useUpdateRadioState();

  const { data: radioStateData } = useQuery({
    queryKey: ["radioState"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_content").select("*").eq("section", "radio");
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
    },
  });

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", artist: "", description: "", sort_order: 0 });
  const [file, setFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const [liveForm, setLiveForm] = useState({
    streamUrl: "",
    liveTitle: "",
    liveDescription: "",
    liveImage: "",
  });

  const currentMode = radioStateData?.mode || "off";

  useEffect(() => {
    if (!radioStateData) return;
    setLiveForm({
      streamUrl: radioStateData.streamUrl,
      liveTitle: radioStateData.liveTitle,
      liveDescription: radioStateData.liveDescription,
      liveImage: radioStateData.liveImage,
    });
  }, [radioStateData]);

  const resetForm = () => {
    setShowForm(false);
    setEditId(null);
    setForm({ title: "", artist: "", description: "", sort_order: 0 });
    setFile(null);
    setCoverFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      if (editId) {
        const updates: Record<string, unknown> = { id: editId, ...form };

        if (file) {
          const path = `radio/${Date.now()}-${file.name}`;
          const { storagePath, publicUrl } = await uploadAssetFile(file, path);
          updates.storage_path = storagePath;
          updates.audio_url = publicUrl;
        }

        if (coverFile) {
          const coverPath = `radio/covers/${Date.now()}-${coverFile.name}`;
          const { publicUrl } = await uploadAssetFile(coverFile, coverPath);
          updates.cover_image_url = publicUrl;
        }

        await updateTrack.mutateAsync(updates as any);
        toast({ title: "Track updated" });
      } else {
        if (!file) {
          toast({ title: "Audio file required", variant: "destructive" });
          setUploading(false);
          return;
        }

        const path = `radio/${Date.now()}-${file.name}`;
        const { storagePath, publicUrl } = await uploadAssetFile(file, path);

        let coverUrl = "";
        if (coverFile) {
          const coverPath = `radio/covers/${Date.now()}-${coverFile.name}`;
          const result = await uploadAssetFile(coverFile, coverPath);
          coverUrl = result.publicUrl;
        }

        await createTrack.mutateAsync({
          ...form,
          audio_url: publicUrl,
          storage_path: storagePath,
          cover_image_url: coverUrl,
        });

        toast({ title: "Track added" });
      }

      resetForm();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }

    setUploading(false);
  };

  const handleSaveLiveSettings = async () => {
    try {
      await updateRadioState.mutateAsync({
        streamUrl: liveForm.streamUrl,
        liveTitle: liveForm.liveTitle,
        liveDescription: liveForm.liveDescription,
        liveImage: liveForm.liveImage,
      });

      toast({ title: "Live transmission metadata saved" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleSetMode = async (mode: RadioMode) => {
    try {
      if (mode === "live" && !liveForm.streamUrl.trim()) {
        toast({
          title: "Live stream URL required",
          description: "Add your Icecast/Shoutcast URL before going live.",
          variant: "destructive",
        });
        return;
      }

      if (mode === "live") {
        await updateRadioState.mutateAsync({
          mode: "live",
          streamUrl: liveForm.streamUrl,
          liveTitle: liveForm.liveTitle,
          liveDescription: liveForm.liveDescription,
          liveImage: liveForm.liveImage,
        });
      } else if (mode === "prerecorded") {
        if (!tracks || tracks.filter((track) => track.is_active).length === 0) {
          toast({
            title: "No active tracks",
            description: "Upload and activate at least one track before starting prerecorded mode.",
            variant: "destructive",
          });
          return;
        }

        await updateRadioState.mutateAsync({ mode: "prerecorded" });
      } else {
        await updateRadioState.mutateAsync({ mode: "off" });
      }

      toast({ title: mode === "off" ? "Radio stopped" : `Radio set to ${mode}` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this track?")) return;

    await deleteTrack.mutateAsync(id);
    toast({ title: "Track deleted" });
  };

  const handleToggleTrack = async (track: RadioTrack) => {
    try {
      await updateTrack.mutateAsync({ id: track.id, is_active: !track.is_active });
      toast({ title: track.is_active ? "Track disabled" : "Track enabled" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const startEdit = (track: RadioTrack) => {
    setEditId(track.id);
    setForm({ title: track.title, artist: track.artist, description: track.description || "", sort_order: track.sort_order });
    setShowForm(true);
  };

  return (
    <div className="space-y-8">
      <div className="glow-border-orange rounded-2xl bg-card p-6 relative">
        <div className="scanline absolute inset-0 pointer-events-none opacity-10 rounded-2xl" />
        <div className="relative z-10">
          <h3 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Radio className="w-5 h-5 text-primary" />
            BROADCAST MODE
          </h3>

          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-display tracking-wider text-muted-foreground">CURRENT:</span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-display tracking-wider border ${
                currentMode === "live"
                  ? "border-destructive text-destructive"
                  : currentMode === "prerecorded"
                    ? "border-primary text-primary"
                    : "border-muted-foreground text-muted-foreground"
              }`}
            >
              {currentMode.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
            <Button
              variant={currentMode === "prerecorded" ? "neon" : "portal"}
              onClick={() => handleSetMode("prerecorded")}
              className="w-full"
            >
              <Music className="w-4 h-4 mr-2" /> Start Prerecorded
            </Button>
            <Button
              variant={currentMode === "live" ? "neon" : "portal"}
              onClick={() => handleSetMode("live")}
              className="w-full"
            >
              <Radio className="w-4 h-4 mr-2" /> Go Live
            </Button>
            <Button variant="portal" onClick={() => handleSetMode("off")} className="w-full">
              Stop Radio
            </Button>
          </div>

          <div className="border-t border-border pt-4">
            <h4 className="font-display text-sm font-bold text-foreground mb-3">LIVE STREAM SETTINGS</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="font-display text-xs tracking-wider text-muted-foreground uppercase">
                  Icecast/Shoutcast Stream URL
                </Label>
                <Input
                  value={liveForm.streamUrl}
                  onChange={(e) => setLiveForm({ ...liveForm, streamUrl: e.target.value })}
                  className="mt-1 bg-muted border-border"
                  placeholder="https://your-radio-server.example/live"
                />
              </div>

              <div>
                <Label className="font-display text-xs tracking-wider text-muted-foreground uppercase">Live Title</Label>
                <Input
                  value={liveForm.liveTitle}
                  onChange={(e) => setLiveForm({ ...liveForm, liveTitle: e.target.value })}
                  className="mt-1 bg-muted border-border"
                  placeholder="BPM CTRL LIVE"
                />
              </div>

              <div>
                <Label className="font-display text-xs tracking-wider text-muted-foreground uppercase">Live Description</Label>
                <Input
                  value={liveForm.liveDescription}
                  onChange={(e) => setLiveForm({ ...liveForm, liveDescription: e.target.value })}
                  className="mt-1 bg-muted border-border"
                  placeholder="Live from the underground..."
                />
              </div>

              <div>
                <Label className="font-display text-xs tracking-wider text-muted-foreground uppercase">Live Cover Image URL</Label>
                <Input
                  value={liveForm.liveImage}
                  onChange={(e) => setLiveForm({ ...liveForm, liveImage: e.target.value })}
                  className="mt-1 bg-muted border-border"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="mt-4">
              <Button variant="portal" onClick={handleSaveLiveSettings}>
                <Save className="w-4 h-4 mr-2" /> Save Live Metadata
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-display text-lg font-bold gradient-text-orange">TRACK LIBRARY</h3>
            <p className="text-muted-foreground text-sm font-body mt-1">
              Audio files that loop during prerecorded mode
            </p>
          </div>
          <Button variant="neon" onClick={() => { resetForm(); setShowForm(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Add Track
          </Button>
        </div>

        {showForm && (
          <div className="glow-border-orange rounded-2xl bg-card p-6 mb-6 relative">
            <div className="scanline absolute inset-0 pointer-events-none opacity-10 rounded-2xl" />
            <div className="relative z-10">
              <h4 className="font-display text-sm font-bold text-foreground mb-4">
                {editId ? "Edit Track" : "Upload New Track"}
              </h4>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="font-display text-xs tracking-wider text-muted-foreground uppercase">Title</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="mt-1 bg-muted border-border"
                    required
                  />
                </div>

                <div>
                  <Label className="font-display text-xs tracking-wider text-muted-foreground uppercase">Artist</Label>
                  <Input
                    value={form.artist}
                    onChange={(e) => setForm({ ...form, artist: e.target.value })}
                    className="mt-1 bg-muted border-border"
                  />
                </div>

                <div>
                  <Label className="font-display text-xs tracking-wider text-muted-foreground uppercase">Description</Label>
                  <Input
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="mt-1 bg-muted border-border"
                  />
                </div>

                <div>
                  <Label className="font-display text-xs tracking-wider text-muted-foreground uppercase">Sort Order</Label>
                  <Input
                    type="number"
                    value={form.sort_order}
                    onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value, 10) || 0 })}
                    className="mt-1 bg-muted border-border"
                  />
                </div>

                <div>
                  <Label className="font-display text-xs tracking-wider text-muted-foreground uppercase">
                    {editId ? "Replace Audio (optional)" : "Audio File"}
                  </Label>
                  <label className="mt-1 flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-muted hover:bg-muted/80 cursor-pointer transition-colors">
                    <Upload className="w-4 h-4 text-primary" />
                    <span className="text-sm font-body text-foreground">{file ? file.name : "Choose audio file"}</span>
                    <input type="file" accept="audio/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                  </label>
                </div>

                <div>
                  <Label className="font-display text-xs tracking-wider text-muted-foreground uppercase">Cover Image (optional)</Label>
                  <label className="mt-1 flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-muted hover:bg-muted/80 cursor-pointer transition-colors">
                    <Upload className="w-4 h-4 text-primary" />
                    <span className="text-sm font-body text-foreground">{coverFile ? coverFile.name : "Choose image"}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} />
                  </label>
                </div>

                <div className="md:col-span-2 flex gap-3">
                  <Button variant="neon" type="submit" disabled={uploading}>
                    {uploading ? "Uploading..." : editId ? "Update" : "Upload"}
                  </Button>
                  <Button variant="portal" type="button" onClick={resetForm}>Cancel</Button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="glow-border-orange rounded-2xl bg-card overflow-hidden relative">
          <div className="scanline absolute inset-0 pointer-events-none opacity-5 rounded-2xl" />
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="font-display text-xs tracking-wider text-muted-foreground">#</TableHead>
                <TableHead className="font-display text-xs tracking-wider text-muted-foreground">Title</TableHead>
                <TableHead className="font-display text-xs tracking-wider text-muted-foreground">Artist</TableHead>
                <TableHead className="font-display text-xs tracking-wider text-muted-foreground">Status</TableHead>
                <TableHead className="font-display text-xs tracking-wider text-muted-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8 font-body">
                    Loading tracks...
                  </TableCell>
                </TableRow>
              )}

              {!isLoading && (tracks || []).map((track, index) => (
                <TableRow key={track.id} className="border-border">
                  <TableCell className="text-xs text-muted-foreground">{index + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {track.cover_image_url ? (
                        <img src={track.cover_image_url} alt={`${track.title} cover`} className="w-8 h-8 rounded object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                          <Music className="w-4 h-4 text-primary" />
                        </div>
                      )}
                      <span className="font-body text-sm text-foreground">{track.title}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground font-body">{track.artist || "—"}</TableCell>
                  <TableCell>
                    <span className={`w-2 h-2 rounded-full inline-block ${track.is_active ? "bg-primary" : "bg-muted-foreground"}`} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleToggleTrack(track)} title={track.is_active ? "Disable" : "Enable"}>
                        {track.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => startEdit(track)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(track.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {!isLoading && (!tracks || tracks.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8 font-body">
                    No tracks uploaded yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default TransmissionCenter;
