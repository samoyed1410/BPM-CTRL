import { useState } from "react";
import { Mic } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useUpdateRadioState } from "@/hooks/useRadio";
import { useToast } from "@/hooks/use-toast";

/**
 * Floating "GO LIVE NOW" button — visible only to authenticated admins.
 * Updates Supabase site_content rows for the radio section so all listeners
 * receive the change via realtime subscription.
 */
const DJGoLiveButton = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const updateRadio = useUpdateRadioState();
  const [open, setOpen] = useState(false);
  const [streamUrl, setStreamUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  if (!user || !isAdmin) return null;

  const goLive = async () => {
    if (!streamUrl.trim() || !title.trim()) {
      toast({ title: "Missing fields", description: "Stream URL and title are required.", variant: "destructive" });
      return;
    }
    try {
      await updateRadio.mutateAsync({
        mode: "live",
        streamUrl: streamUrl.trim(),
        liveTitle: title.trim(),
        liveDescription: description.trim(),
      });
      toast({ title: "🔴 You're LIVE", description: "All listeners now see your stream." });
      setOpen(false);
    } catch (e: any) {
      toast({ title: "Failed to go live", description: e.message, variant: "destructive" });
    }
  };

  const endLive = async () => {
    await updateRadio.mutateAsync({ mode: "off" });
    toast({ title: "Stream ended" });
  };

  return (
    <>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring" }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          variant="neon"
          size="lg"
          onClick={() => setOpen(true)}
          className="shadow-[0_0_30px_hsl(var(--primary)/0.6)] animate-pulse"
        >
          <Mic className="w-4 h-4" />
          🎙️ GO LIVE NOW
        </Button>
      </motion.div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start Live Transmission</DialogTitle>
            <DialogDescription>
              Broadcast a live stream to all listeners. Supports MP3 and HLS (.m3u8) URLs.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label htmlFor="stream-url">Stream URL</Label>
              <Input
                id="stream-url"
                placeholder="https://stream.example.com/live.mp3 or .m3u8"
                value={streamUrl}
                onChange={(e) => setStreamUrl(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="stream-title">Show Title</Label>
              <Input
                id="stream-title"
                placeholder="AFRO FREQUENCY — Live Set"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="stream-desc">Description (optional)</Label>
              <Input
                id="stream-desc"
                placeholder="DJ Ìfé live from Lagos"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={endLive}>End Stream</Button>
            <Button variant="neon" onClick={goLive} disabled={updateRadio.isPending}>
              {updateRadio.isPending ? "Starting..." : "Go Live"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DJGoLiveButton;
