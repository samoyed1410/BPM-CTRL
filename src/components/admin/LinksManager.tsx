import { useState, useEffect } from "react";
import { useSectionContent, useUpdateContent, useCreateContent, getContentValue } from "@/hooks/useSiteContent";
import type { SiteContent } from "@/hooks/useSiteContent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Instagram, Twitter, Music, Ticket, Plus, Save, ExternalLink } from "lucide-react";

interface LinkField {
  key: string;
  label: string;
  icon: React.ElementType;
  placeholder: string;
}

const LINK_FIELDS: LinkField[] = [
  { key: "instagram_url", label: "Instagram", icon: Instagram, placeholder: "https://instagram.com/yourpage" },
  { key: "twitter_url", label: "Twitter / X", icon: Twitter, placeholder: "https://twitter.com/yourpage" },
  { key: "tiktok_url", label: "TikTok", icon: Music, placeholder: "https://tiktok.com/@yourpage" },
  { key: "access_ticket_url", label: "Access Ticket Link", icon: Ticket, placeholder: "https://tickets.example.com" },
];

const LinksManager = () => {
  const { toast } = useToast();
  const { data: content, isLoading } = useSectionContent("links");
  const updateContent = useUpdateContent();
  const createContent = useCreateContent();

  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (content) {
      const v: Record<string, string> = {};
      LINK_FIELDS.forEach((f) => {
        v[f.key] = getContentValue(content, f.key, "");
      });
      setValues(v);
    }
  }, [content]);

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const field of LINK_FIELDS) {
        const existing = content?.find((c) => c.content_key === field.key);
        if (existing) {
          await updateContent.mutateAsync({ id: existing.id, content_value: values[field.key] || "" });
        } else {
          await createContent.mutateAsync({
            section: "links",
            content_key: field.key,
            content_value: values[field.key] || "",
            content_type: "text",
            sort_order: LINK_FIELDS.indexOf(field),
          });
        }
      }
      toast({ title: "Links saved" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setSaving(false);
  };

  if (isLoading) {
    return <div className="py-8 text-center text-muted-foreground font-body">Loading links...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-black gradient-text-orange">LINKS</h2>
          <p className="text-muted-foreground text-sm font-body mt-1">
            Manage social media URLs, ticket links, and external links displayed on the site
          </p>
        </div>
      </div>

      <div className="glow-border-orange rounded-2xl bg-card p-6 relative">
        <div className="scanline absolute inset-0 pointer-events-none opacity-10 rounded-2xl" />
        <div className="relative z-10 space-y-6">
          {LINK_FIELDS.map((field) => {
            const Icon = field.icon;
            return (
              <div key={field.key} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <Label className="font-display text-xs tracking-wider text-muted-foreground uppercase">
                    {field.label}
                  </Label>
                  <Input
                    value={values[field.key] || ""}
                    onChange={(e) => setValues({ ...values, [field.key]: e.target.value })}
                    className="mt-1 bg-muted border-border"
                    placeholder={field.placeholder}
                  />
                </div>
                {values[field.key] && (
                  <a
                    href={values[field.key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors mt-5"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            );
          })}

          <div className="pt-4 border-t border-border">
            <Button variant="neon" onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save All Links"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinksManager;
