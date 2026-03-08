import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAllSiteAssets, useCreateAsset, useUpdateAsset, useDeleteAsset, uploadAssetFile } from "@/hooks/useSiteAssets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Plus, Edit, Eye, EyeOff, LogOut, Upload, ArrowLeft } from "lucide-react";
import type { SiteAsset } from "@/hooks/useSiteAssets";

const SECTIONS = ["hero", "event", "broadcast", "style", "archive", "community", "gamification", "general"];

const Admin = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: assets, isLoading: assetsLoading } = useAllSiteAssets();
  const createAsset = useCreateAsset();
  const updateAsset = useUpdateAsset();
  const deleteAsset = useDeleteAsset();

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "", section: "general", asset_type: "image", sort_order: 0 });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/admin/login");
    }
  }, [loading, user, isAdmin, navigate]);

  if (loading || assetsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      if (editId) {
        let updates: Record<string, unknown> = { id: editId, ...form };
        if (file) {
          const path = `${form.section}/${Date.now()}-${file.name}`;
          const { storagePath, publicUrl } = await uploadAssetFile(file, path);
          updates = { ...updates, storage_path: storagePath, public_url: publicUrl };
        }
        await updateAsset.mutateAsync(updates as any);
        toast({ title: "Asset updated" });
      } else {
        if (!file) { toast({ title: "File required", variant: "destructive" }); setUploading(false); return; }
        const path = `${form.section}/${Date.now()}-${file.name}`;
        const { storagePath, publicUrl } = await uploadAssetFile(file, path);
        await createAsset.mutateAsync({ ...form, storage_path: storagePath, public_url: publicUrl });
        toast({ title: "Asset created" });
      }
      resetForm();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setUploading(false);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditId(null);
    setForm({ name: "", description: "", section: "general", asset_type: "image", sort_order: 0 });
    setFile(null);
  };

  const startEdit = (asset: SiteAsset) => {
    setEditId(asset.id);
    setForm({ name: asset.name, description: asset.description || "", section: asset.section, asset_type: asset.asset_type, sort_order: asset.sort_order });
    setShowForm(true);
  };

  const toggleActive = async (asset: SiteAsset) => {
    await updateAsset.mutateAsync({ id: asset.id, is_active: !asset.is_active });
    toast({ title: asset.is_active ? "Asset hidden" : "Asset visible" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this asset permanently?")) return;
    await deleteAsset.mutateAsync(id);
    toast({ title: "Asset deleted" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </a>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
              <span className="font-display text-sm font-bold tracking-[0.15em]">
                BPM<span className="text-primary"> CTRL</span>
              </span>
            </div>
            <span className="text-xs font-display tracking-wider text-muted-foreground uppercase">/ Admin Panel</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground font-body">{user?.email}</span>
            <Button variant="ghost" size="sm" onClick={() => signOut().then(() => navigate("/"))}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-black gradient-text-orange">ASSET CONTROL</h1>
            <p className="text-muted-foreground text-sm font-body mt-1">Manage photos and assets across the site</p>
          </div>
          <Button variant="neon" onClick={() => { resetForm(); setShowForm(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Add Asset
          </Button>
        </div>

        {/* Upload Form */}
        {showForm && (
          <div className="glow-border-orange rounded-2xl bg-card p-6 mb-8 relative">
            <div className="scanline absolute inset-0 pointer-events-none opacity-10 rounded-2xl" />
            <div className="relative z-10">
              <h3 className="font-display text-lg font-bold text-foreground mb-4">
                {editId ? "Edit Asset" : "Upload New Asset"}
              </h3>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="font-display text-xs tracking-wider text-muted-foreground uppercase">Name</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 bg-muted border-border" required />
                </div>
                <div>
                  <Label className="font-display text-xs tracking-wider text-muted-foreground uppercase">Section</Label>
                  <select
                    value={form.section}
                    onChange={(e) => setForm({ ...form, section: e.target.value })}
                    className="mt-1 w-full bg-muted border border-border rounded-md px-3 py-2 text-foreground text-sm"
                  >
                    {SECTIONS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <Label className="font-display text-xs tracking-wider text-muted-foreground uppercase">Type</Label>
                  <select
                    value={form.asset_type}
                    onChange={(e) => setForm({ ...form, asset_type: e.target.value })}
                    className="mt-1 w-full bg-muted border border-border rounded-md px-3 py-2 text-foreground text-sm"
                  >
                    <option value="image">Image</option>
                    <option value="icon">Icon</option>
                    <option value="illustration">Illustration</option>
                  </select>
                </div>
                <div>
                  <Label className="font-display text-xs tracking-wider text-muted-foreground uppercase">Sort Order</Label>
                  <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} className="mt-1 bg-muted border-border" />
                </div>
                <div className="md:col-span-2">
                  <Label className="font-display text-xs tracking-wider text-muted-foreground uppercase">Description</Label>
                  <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1 bg-muted border-border" />
                </div>
                <div className="md:col-span-2">
                  <Label className="font-display text-xs tracking-wider text-muted-foreground uppercase">
                    {editId ? "Replace File (optional)" : "File"}
                  </Label>
                  <div className="mt-1 flex items-center gap-3">
                    <label className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-muted hover:bg-muted/80 cursor-pointer transition-colors">
                      <Upload className="w-4 h-4 text-primary" />
                      <span className="text-sm font-body text-foreground">{file ? file.name : "Choose file"}</span>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                    </label>
                  </div>
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

        {/* Assets by section */}
        <Tabs defaultValue="all">
          <TabsList className="bg-muted mb-6">
            <TabsTrigger value="all" className="font-display text-xs tracking-wider">All</TabsTrigger>
            {SECTIONS.map((s) => (
              <TabsTrigger key={s} value={s} className="font-display text-xs tracking-wider">
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>

          {["all", ...SECTIONS].map((tab) => (
            <TabsContent key={tab} value={tab}>
              <div className="glow-border-orange rounded-2xl bg-card overflow-hidden relative">
                <div className="scanline absolute inset-0 pointer-events-none opacity-5 rounded-2xl" />
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead className="font-display text-xs tracking-wider text-muted-foreground">Preview</TableHead>
                      <TableHead className="font-display text-xs tracking-wider text-muted-foreground">Name</TableHead>
                      <TableHead className="font-display text-xs tracking-wider text-muted-foreground">Section</TableHead>
                      <TableHead className="font-display text-xs tracking-wider text-muted-foreground">Type</TableHead>
                      <TableHead className="font-display text-xs tracking-wider text-muted-foreground">Status</TableHead>
                      <TableHead className="font-display text-xs tracking-wider text-muted-foreground text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(assets || [])
                      .filter((a) => tab === "all" || a.section === tab)
                      .map((asset) => (
                        <TableRow key={asset.id} className="border-border">
                          <TableCell>
                            <img src={asset.public_url} alt={asset.name} className="w-12 h-12 rounded-lg object-cover bg-muted" />
                          </TableCell>
                          <TableCell className="font-body text-sm text-foreground">{asset.name}</TableCell>
                          <TableCell>
                            <span className="px-2 py-1 rounded-full border border-primary/30 text-[10px] font-display tracking-wider text-primary uppercase">
                              {asset.section}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs font-body text-muted-foreground">{asset.asset_type}</TableCell>
                          <TableCell>
                            <span className={`w-2 h-2 rounded-full inline-block ${asset.is_active ? "bg-primary" : "bg-muted-foreground"}`} />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={() => toggleActive(asset)} title={asset.is_active ? "Hide" : "Show"}>
                                {asset.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => startEdit(asset)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(asset.id)} className="text-destructive hover:text-destructive">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    {(assets || []).filter((a) => tab === "all" || a.section === tab).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8 font-body">
                          No assets in this section yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
