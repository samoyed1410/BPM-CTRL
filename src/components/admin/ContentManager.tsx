import { useState } from "react";
import { useAllSiteContent, useUpdateContent, useCreateContent, useDeleteContent } from "@/hooks/useSiteContent";
import type { SiteContent } from "@/hooks/useSiteContent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Plus, Edit, Eye, EyeOff } from "lucide-react";

const CONTENT_SECTIONS = ["hero", "event", "broadcast", "style", "archive", "community", "email", "gamification"];

const ContentManager = () => {
  const { toast } = useToast();
  const { data: allContent, isLoading } = useAllSiteContent();
  const updateContent = useUpdateContent();
  const createContent = useCreateContent();
  const deleteContent = useDeleteContent();

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ section: "event", content_key: "", content_value: "", content_type: "text", sort_order: 0 });

  const resetForm = () => {
    setShowForm(false);
    setEditId(null);
    setForm({ section: "event", content_key: "", content_value: "", content_type: "text", sort_order: 0 });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await updateContent.mutateAsync({ id: editId, ...form });
        toast({ title: "Content updated" });
      } else {
        await createContent.mutateAsync(form);
        toast({ title: "Content created" });
      }
      resetForm();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const startEdit = (item: SiteContent) => {
    setEditId(item.id);
    setForm({
      section: item.section,
      content_key: item.content_key,
      content_value: item.content_value,
      content_type: item.content_type,
      sort_order: item.sort_order,
    });
    setShowForm(true);
  };

  const toggleActive = async (item: SiteContent) => {
    await updateContent.mutateAsync({ id: item.id, is_active: !item.is_active });
    toast({ title: item.is_active ? "Content hidden" : "Content visible" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this content entry permanently?")) return;
    await deleteContent.mutateAsync(id);
    toast({ title: "Content deleted" });
  };

  if (isLoading) {
    return <div className="py-8 text-center text-muted-foreground font-body">Loading content...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-black gradient-text-orange">SITE CONTENT</h2>
          <p className="text-muted-foreground text-sm font-body mt-1">Edit text, event names, descriptions, and section content</p>
        </div>
        <Button variant="neon" onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Add Content
        </Button>
      </div>

      {showForm && (
        <div className="glow-border-orange rounded-2xl bg-card p-6 mb-8 relative">
          <div className="scanline absolute inset-0 pointer-events-none opacity-10 rounded-2xl" />
          <div className="relative z-10">
            <h3 className="font-display text-lg font-bold text-foreground mb-4">
              {editId ? "Edit Content" : "New Content Entry"}
            </h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="font-display text-xs tracking-wider text-muted-foreground uppercase">Section</Label>
                <select
                  value={form.section}
                  onChange={(e) => setForm({ ...form, section: e.target.value })}
                  className="mt-1 w-full bg-muted border border-border rounded-md px-3 py-2 text-foreground text-sm"
                >
                  {CONTENT_SECTIONS.map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="font-display text-xs tracking-wider text-muted-foreground uppercase">Key</Label>
                <Input
                  value={form.content_key}
                  onChange={(e) => setForm({ ...form, content_key: e.target.value })}
                  className="mt-1 bg-muted border-border"
                  placeholder="e.g. event_name"
                  required
                  disabled={!!editId}
                />
              </div>
              <div>
                <Label className="font-display text-xs tracking-wider text-muted-foreground uppercase">Type</Label>
                <select
                  value={form.content_type}
                  onChange={(e) => setForm({ ...form, content_type: e.target.value })}
                  className="mt-1 w-full bg-muted border border-border rounded-md px-3 py-2 text-foreground text-sm"
                >
                  <option value="text">Text</option>
                  <option value="json">JSON</option>
                </select>
              </div>
              <div>
                <Label className="font-display text-xs tracking-wider text-muted-foreground uppercase">Sort Order</Label>
                <Input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                  className="mt-1 bg-muted border-border"
                />
              </div>
              <div className="md:col-span-2">
                <Label className="font-display text-xs tracking-wider text-muted-foreground uppercase">Value</Label>
                <textarea
                  value={form.content_value}
                  onChange={(e) => setForm({ ...form, content_value: e.target.value })}
                  className="mt-1 w-full bg-muted border border-border rounded-md px-3 py-2 text-foreground text-sm min-h-[100px] font-body"
                  required
                />
              </div>
              <div className="md:col-span-2 flex gap-3">
                <Button variant="neon" type="submit">
                  {editId ? "Update" : "Create"}
                </Button>
                <Button variant="portal" type="button" onClick={resetForm}>Cancel</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Tabs defaultValue="all">
        <TabsList className="bg-muted mb-6 flex-wrap">
          <TabsTrigger value="all" className="font-display text-xs tracking-wider">All</TabsTrigger>
          {CONTENT_SECTIONS.map((s) => (
            <TabsTrigger key={s} value={s} className="font-display text-xs tracking-wider">
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </TabsTrigger>
          ))}
        </TabsList>

        {["all", ...CONTENT_SECTIONS].map((tab) => (
          <TabsContent key={tab} value={tab}>
            <div className="glow-border-orange rounded-2xl bg-card overflow-hidden relative">
              <div className="scanline absolute inset-0 pointer-events-none opacity-5 rounded-2xl" />
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="font-display text-xs tracking-wider text-muted-foreground">Key</TableHead>
                    <TableHead className="font-display text-xs tracking-wider text-muted-foreground">Value</TableHead>
                    <TableHead className="font-display text-xs tracking-wider text-muted-foreground">Section</TableHead>
                    <TableHead className="font-display text-xs tracking-wider text-muted-foreground">Type</TableHead>
                    <TableHead className="font-display text-xs tracking-wider text-muted-foreground">Status</TableHead>
                    <TableHead className="font-display text-xs tracking-wider text-muted-foreground text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(allContent || [])
                    .filter((c) => tab === "all" || c.section === tab)
                    .map((item) => (
                      <TableRow key={item.id} className="border-border">
                        <TableCell className="font-mono text-xs text-foreground">{item.content_key}</TableCell>
                        <TableCell className="font-body text-sm text-foreground max-w-[300px] truncate">
                          {item.content_value.length > 80
                            ? item.content_value.slice(0, 80) + "..."
                            : item.content_value}
                        </TableCell>
                        <TableCell>
                          <span className="px-2 py-1 rounded-full border border-primary/30 text-[10px] font-display tracking-wider text-primary uppercase">
                            {item.section}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs font-body text-muted-foreground">{item.content_type}</TableCell>
                        <TableCell>
                          <span className={`w-2 h-2 rounded-full inline-block ${item.is_active ? "bg-primary" : "bg-muted-foreground"}`} />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => toggleActive(item)} title={item.is_active ? "Hide" : "Show"}>
                              {item.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => startEdit(item)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="text-destructive hover:text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  {(allContent || []).filter((c) => tab === "all" || c.section === tab).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8 font-body">
                        No content in this section yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ContentManager;
