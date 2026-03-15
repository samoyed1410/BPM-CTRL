import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useSectionContent, useCreateContent, useUpdateContent, getContentValue } from "@/hooks/useSiteContent";
import { uploadAssetFile } from "@/hooks/useSiteAssets";
import { Newspaper, Save, Plus, Edit, Trash2, Upload, ImageIcon, Music, Video } from "lucide-react";

interface ArticleTemplate {
  titleMaxWords: number;
  introMaxWords: number;
  bodyMaxWords: number;
  heroWidth: number;
  heroHeight: number;
  galleryWidth: number;
  galleryHeight: number;
  galleryCount: number;
}

interface ArticleItem {
  id: string;
  title: string;
  intro: string;
  body: string;
  heroImage: string;
  galleryImages: string[];
  audioUrl: string;
  videoUrl: string;
  publishedAt: string;
  updatedAt: string;
}

interface ArticleFormState {
  title: string;
  intro: string;
  body: string;
  heroImage: string;
  galleryImages: string[];
  audioUrl: string;
  videoUrl: string;
}

const DEFAULT_TEMPLATE: ArticleTemplate = {
  titleMaxWords: 12,
  introMaxWords: 45,
  bodyMaxWords: 500,
  heroWidth: 1600,
  heroHeight: 900,
  galleryWidth: 1080,
  galleryHeight: 1080,
  galleryCount: 2,
};

const countWords = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

const safeJson = <T,>(value: string, fallback: T): T => {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const emptyForm = (galleryCount: number): ArticleFormState => ({
  title: "",
  intro: "",
  body: "",
  heroImage: "",
  galleryImages: Array.from({ length: galleryCount }, () => ""),
  audioUrl: "",
  videoUrl: "",
});

const clampGalleryCount = (value: number) => Math.max(1, Math.min(4, value || 1));

const ArticlesManager = () => {
  const { toast } = useToast();
  const { data: content, isLoading } = useSectionContent("articles");
  const createContent = useCreateContent();
  const updateContent = useUpdateContent();

  const [sectionTagline, setSectionTagline] = useState("Field Notes");
  const [sectionTitle, setSectionTitle] = useState("TRANSMISSION ARTICLES");
  const [sectionDescription, setSectionDescription] = useState(
    "Long-form signal drops with structured media layouts managed from admin."
  );

  const [template, setTemplate] = useState<ArticleTemplate>(DEFAULT_TEMPLATE);
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ArticleFormState>(emptyForm(DEFAULT_TEMPLATE.galleryCount));

  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<Array<File | null>>(
    Array.from({ length: DEFAULT_TEMPLATE.galleryCount }, () => null)
  );
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const [savingTemplate, setSavingTemplate] = useState(false);
  const [savingArticle, setSavingArticle] = useState(false);

  useEffect(() => {
    if (!content) return;

    setSectionTagline(getContentValue(content, "articles_tagline", "Field Notes"));
    setSectionTitle(getContentValue(content, "articles_title", "TRANSMISSION ARTICLES"));
    setSectionDescription(
      getContentValue(
        content,
        "articles_description",
        "Long-form signal drops with structured media layouts managed from admin."
      )
    );

    const parsedTemplate = safeJson<ArticleTemplate>(
      getContentValue(content, "articles_template", JSON.stringify(DEFAULT_TEMPLATE)),
      DEFAULT_TEMPLATE
    );

    setTemplate({
      ...DEFAULT_TEMPLATE,
      ...parsedTemplate,
      galleryCount: clampGalleryCount(parsedTemplate.galleryCount || DEFAULT_TEMPLATE.galleryCount),
    });

    const parsedItems = safeJson<ArticleItem[]>(getContentValue(content, "articles_items", "[]"), []);
    setArticles(Array.isArray(parsedItems) ? parsedItems : []);
  }, [content]);

  useEffect(() => {
    setForm((previous) => ({
      ...previous,
      galleryImages: Array.from({ length: clampGalleryCount(template.galleryCount) }, (_, index) => previous.galleryImages[index] || ""),
    }));

    setGalleryFiles((previous) =>
      Array.from({ length: clampGalleryCount(template.galleryCount) }, (_, index) => previous[index] || null)
    );
  }, [template.galleryCount]);

  const wordStats = useMemo(
    () => ({
      title: countWords(form.title),
      intro: countWords(form.intro),
      body: countWords(form.body),
    }),
    [form.title, form.intro, form.body]
  );

  const upsertContentValue = async (key: string, value: string, type: "text" | "json", sortOrder: number) => {
    const existing = content?.find((row) => row.content_key === key);

    if (existing) {
      await updateContent.mutateAsync({ id: existing.id, content_value: value, content_type: type, sort_order: sortOrder });
      return;
    }

    await createContent.mutateAsync({
      section: "articles",
      content_key: key,
      content_value: value,
      content_type: type,
      sort_order: sortOrder,
    });
  };

  const uploadIfProvided = async (file: File | null, path: string, fallbackUrl: string) => {
    if (!file) return fallbackUrl;
    const { publicUrl } = await uploadAssetFile(file, path);
    return publicUrl;
  };

  const resetArticleForm = () => {
    setEditingId(null);
    setForm(emptyForm(clampGalleryCount(template.galleryCount)));
    setHeroFile(null);
    setGalleryFiles(Array.from({ length: clampGalleryCount(template.galleryCount) }, () => null));
    setAudioFile(null);
    setVideoFile(null);
  };

  const saveSectionAndTemplate = async () => {
    setSavingTemplate(true);

    try {
      const nextTemplate = {
        ...template,
        galleryCount: clampGalleryCount(template.galleryCount),
      };

      setTemplate(nextTemplate);

      await upsertContentValue("articles_template", JSON.stringify(nextTemplate), "json", 0);
      await upsertContentValue("articles_tagline", sectionTagline, "text", 2);
      await upsertContentValue("articles_title", sectionTitle, "text", 3);
      await upsertContentValue("articles_description", sectionDescription, "text", 4);

      toast({ title: "Article template saved" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }

    setSavingTemplate(false);
  };

  const handleSaveArticle = async (event: React.FormEvent) => {
    event.preventDefault();

    if (wordStats.title > template.titleMaxWords) {
      toast({ title: "Title too long", description: `Use ${template.titleMaxWords} words or fewer.`, variant: "destructive" });
      return;
    }

    if (wordStats.intro > template.introMaxWords) {
      toast({ title: "Intro too long", description: `Use ${template.introMaxWords} words or fewer.`, variant: "destructive" });
      return;
    }

    if (wordStats.body > template.bodyMaxWords) {
      toast({ title: "Body too long", description: `Use ${template.bodyMaxWords} words or fewer.`, variant: "destructive" });
      return;
    }

    setSavingArticle(true);

    try {
      const articleId = editingId || crypto.randomUUID();
      const existing = articles.find((article) => article.id === editingId);
      const timestamp = new Date().toISOString();

      const heroImage = await uploadIfProvided(
        heroFile,
        `articles/${articleId}/hero-${Date.now()}`,
        form.heroImage.trim()
      );

      const audioUrl = await uploadIfProvided(
        audioFile,
        `articles/${articleId}/audio-${Date.now()}`,
        form.audioUrl.trim()
      );

      const videoUrl = await uploadIfProvided(
        videoFile,
        `articles/${articleId}/video-${Date.now()}`,
        form.videoUrl.trim()
      );

      const galleryImages = await Promise.all(
        form.galleryImages.map((url, index) =>
          uploadIfProvided(
            galleryFiles[index] || null,
            `articles/${articleId}/gallery-${index + 1}-${Date.now()}`,
            url.trim()
          )
        )
      );

      const nextArticle: ArticleItem = {
        id: articleId,
        title: form.title.trim(),
        intro: form.intro.trim(),
        body: form.body.trim(),
        heroImage,
        galleryImages: galleryImages.filter(Boolean).slice(0, clampGalleryCount(template.galleryCount)),
        audioUrl,
        videoUrl,
        publishedAt: existing?.publishedAt || timestamp,
        updatedAt: timestamp,
      };

      const nextArticles = editingId
        ? articles.map((article) => (article.id === editingId ? nextArticle : article))
        : [nextArticle, ...articles];

      await upsertContentValue("articles_items", JSON.stringify(nextArticles), "json", 1);
      setArticles(nextArticles);

      toast({ title: editingId ? "Article updated" : "Article created" });
      resetArticleForm();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }

    setSavingArticle(false);
  };

  const handleEditArticle = (article: ArticleItem) => {
    setEditingId(article.id);
    setForm({
      title: article.title,
      intro: article.intro,
      body: article.body,
      heroImage: article.heroImage || "",
      galleryImages: Array.from(
        { length: clampGalleryCount(template.galleryCount) },
        (_, index) => article.galleryImages[index] || ""
      ),
      audioUrl: article.audioUrl || "",
      videoUrl: article.videoUrl || "",
    });

    setHeroFile(null);
    setAudioFile(null);
    setVideoFile(null);
    setGalleryFiles(Array.from({ length: clampGalleryCount(template.galleryCount) }, () => null));
  };

  const handleDeleteArticle = async (id: string) => {
    if (!confirm("Delete this article?")) return;

    try {
      const nextArticles = articles.filter((article) => article.id !== id);
      await upsertContentValue("articles_items", JSON.stringify(nextArticles), "json", 1);
      setArticles(nextArticles);
      toast({ title: "Article deleted" });

      if (editingId === id) {
        resetArticleForm();
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  if (isLoading) {
    return <div className="py-8 text-center text-muted-foreground font-body">Loading articles...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-black gradient-text-orange flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-primary" /> ARTICLES
        </h2>
        <p className="text-muted-foreground text-sm font-body mt-1">
          Define article typography/media template and publish long-form entries with photos, audio, and video.
        </p>
      </div>

      <div className="glow-border-orange rounded-2xl bg-card p-6 relative">
        <div className="scanline absolute inset-0 pointer-events-none opacity-10 rounded-2xl" />
        <div className="relative z-10 space-y-5">
          <h3 className="font-display text-sm font-bold text-foreground tracking-wider uppercase">Section & Template</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="font-display text-xs tracking-wider text-muted-foreground uppercase">Tagline</Label>
              <Input value={sectionTagline} onChange={(e) => setSectionTagline(e.target.value)} className="mt-1 bg-muted border-border" />
            </div>
            <div>
              <Label className="font-display text-xs tracking-wider text-muted-foreground uppercase">Title</Label>
              <Input value={sectionTitle} onChange={(e) => setSectionTitle(e.target.value)} className="mt-1 bg-muted border-border" />
            </div>
            <div>
              <Label className="font-display text-xs tracking-wider text-muted-foreground uppercase">Description</Label>
              <Input value={sectionDescription} onChange={(e) => setSectionDescription(e.target.value)} className="mt-1 bg-muted border-border" />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label className="font-display text-xs tracking-wider text-muted-foreground uppercase">Title Max Words</Label>
              <Input
                type="number"
                value={template.titleMaxWords}
                onChange={(e) => setTemplate({ ...template, titleMaxWords: parseInt(e.target.value, 10) || 0 })}
                className="mt-1 bg-muted border-border"
              />
            </div>
            <div>
              <Label className="font-display text-xs tracking-wider text-muted-foreground uppercase">Intro Max Words</Label>
              <Input
                type="number"
                value={template.introMaxWords}
                onChange={(e) => setTemplate({ ...template, introMaxWords: parseInt(e.target.value, 10) || 0 })}
                className="mt-1 bg-muted border-border"
              />
            </div>
            <div>
              <Label className="font-display text-xs tracking-wider text-muted-foreground uppercase">Body Max Words</Label>
              <Input
                type="number"
                value={template.bodyMaxWords}
                onChange={(e) => setTemplate({ ...template, bodyMaxWords: parseInt(e.target.value, 10) || 0 })}
                className="mt-1 bg-muted border-border"
              />
            </div>
            <div>
              <Label className="font-display text-xs tracking-wider text-muted-foreground uppercase">Gallery Slots</Label>
              <Input
                type="number"
                value={template.galleryCount}
                onChange={(e) => setTemplate({ ...template, galleryCount: clampGalleryCount(parseInt(e.target.value, 10) || 1) })}
                className="mt-1 bg-muted border-border"
              />
            </div>
            <div>
              <Label className="font-display text-xs tracking-wider text-muted-foreground uppercase">Hero Width</Label>
              <Input
                type="number"
                value={template.heroWidth}
                onChange={(e) => setTemplate({ ...template, heroWidth: parseInt(e.target.value, 10) || 0 })}
                className="mt-1 bg-muted border-border"
              />
            </div>
            <div>
              <Label className="font-display text-xs tracking-wider text-muted-foreground uppercase">Hero Height</Label>
              <Input
                type="number"
                value={template.heroHeight}
                onChange={(e) => setTemplate({ ...template, heroHeight: parseInt(e.target.value, 10) || 0 })}
                className="mt-1 bg-muted border-border"
              />
            </div>
            <div>
              <Label className="font-display text-xs tracking-wider text-muted-foreground uppercase">Gallery Width</Label>
              <Input
                type="number"
                value={template.galleryWidth}
                onChange={(e) => setTemplate({ ...template, galleryWidth: parseInt(e.target.value, 10) || 0 })}
                className="mt-1 bg-muted border-border"
              />
            </div>
            <div>
              <Label className="font-display text-xs tracking-wider text-muted-foreground uppercase">Gallery Height</Label>
              <Input
                type="number"
                value={template.galleryHeight}
                onChange={(e) => setTemplate({ ...template, galleryHeight: parseInt(e.target.value, 10) || 0 })}
                className="mt-1 bg-muted border-border"
              />
            </div>
          </div>

          <Button variant="neon" onClick={saveSectionAndTemplate} disabled={savingTemplate}>
            <Save className="w-4 h-4 mr-2" />
            {savingTemplate ? "Saving..." : "Save Template"}
          </Button>
        </div>
      </div>

      <div className="glow-border-orange rounded-2xl bg-card p-6 relative">
        <div className="scanline absolute inset-0 pointer-events-none opacity-10 rounded-2xl" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-sm font-bold text-foreground tracking-wider uppercase">
              {editingId ? "Edit Article" : "New Article"}
            </h3>
            <Button variant="portal" onClick={resetArticleForm}>
              <Plus className="w-4 h-4 mr-2" /> New Draft
            </Button>
          </div>

          <form onSubmit={handleSaveArticle} className="space-y-4">
            <div>
              <Label className="font-display text-xs tracking-wider text-muted-foreground uppercase">Title</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="mt-1 bg-muted border-border"
                required
              />
              <p className="mt-1 text-[11px] text-muted-foreground">{wordStats.title}/{template.titleMaxWords} words</p>
            </div>

            <div>
              <Label className="font-display text-xs tracking-wider text-muted-foreground uppercase">Intro</Label>
              <Textarea
                value={form.intro}
                onChange={(e) => setForm({ ...form, intro: e.target.value })}
                className="mt-1 bg-muted border-border"
                rows={3}
                required
              />
              <p className="mt-1 text-[11px] text-muted-foreground">{wordStats.intro}/{template.introMaxWords} words</p>
            </div>

            <div>
              <Label className="font-display text-xs tracking-wider text-muted-foreground uppercase">Main Content</Label>
              <Textarea
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                className="mt-1 bg-muted border-border"
                rows={8}
                required
              />
              <p className="mt-1 text-[11px] text-muted-foreground">{wordStats.body}/{template.bodyMaxWords} words</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="font-display text-xs tracking-wider text-muted-foreground uppercase flex items-center gap-2">
                  <ImageIcon className="w-3.5 h-3.5" /> Hero Image URL
                </Label>
                <Input
                  value={form.heroImage}
                  onChange={(e) => setForm({ ...form, heroImage: e.target.value })}
                  className="mt-1 bg-muted border-border"
                  placeholder="https://..."
                />
                <label className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-muted hover:bg-muted/80 cursor-pointer transition-colors">
                  <Upload className="w-4 h-4 text-primary" />
                  <span className="text-xs font-body text-foreground">{heroFile ? heroFile.name : "Upload hero image"}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => setHeroFile(e.target.files?.[0] || null)} />
                </label>
                <p className="mt-1 text-[11px] text-muted-foreground">Preferred size: {template.heroWidth}×{template.heroHeight}px</p>
              </div>

              <div>
                <Label className="font-display text-xs tracking-wider text-muted-foreground uppercase flex items-center gap-2">
                  <Music className="w-3.5 h-3.5" /> Audio URL
                </Label>
                <Input
                  value={form.audioUrl}
                  onChange={(e) => setForm({ ...form, audioUrl: e.target.value })}
                  className="mt-1 bg-muted border-border"
                  placeholder="https://..."
                />
                <label className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-muted hover:bg-muted/80 cursor-pointer transition-colors">
                  <Upload className="w-4 h-4 text-primary" />
                  <span className="text-xs font-body text-foreground">{audioFile ? audioFile.name : "Upload audio"}</span>
                  <input type="file" accept="audio/*" className="hidden" onChange={(e) => setAudioFile(e.target.files?.[0] || null)} />
                </label>
              </div>
            </div>

            <div>
              <Label className="font-display text-xs tracking-wider text-muted-foreground uppercase flex items-center gap-2 mb-2">
                <ImageIcon className="w-3.5 h-3.5" /> Gallery Images ({template.galleryCount} slots)
              </Label>
              <div className="space-y-3">
                {form.galleryImages.map((imageUrl, index) => (
                  <div key={`gallery-slot-${index}`} className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2">
                    <Input
                      value={imageUrl}
                      onChange={(e) => {
                        const next = [...form.galleryImages];
                        next[index] = e.target.value;
                        setForm({ ...form, galleryImages: next });
                      }}
                      className="bg-muted border-border"
                      placeholder={`Gallery image ${index + 1} URL`}
                    />
                    <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-muted hover:bg-muted/80 cursor-pointer transition-colors">
                      <Upload className="w-4 h-4 text-primary" />
                      <span className="text-xs font-body text-foreground whitespace-nowrap">
                        {galleryFiles[index] ? galleryFiles[index]?.name : `Upload slot ${index + 1}`}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const next = [...galleryFiles];
                          next[index] = e.target.files?.[0] || null;
                          setGalleryFiles(next);
                        }}
                      />
                    </label>
                  </div>
                ))}
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">Preferred size per image: {template.galleryWidth}×{template.galleryHeight}px</p>
            </div>

            <div>
              <Label className="font-display text-xs tracking-wider text-muted-foreground uppercase flex items-center gap-2">
                <Video className="w-3.5 h-3.5" /> Video URL / Embed URL
              </Label>
              <Input
                value={form.videoUrl}
                onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                className="mt-1 bg-muted border-border"
                placeholder="https://youtube.com/watch?v=..."
              />
              <label className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-muted hover:bg-muted/80 cursor-pointer transition-colors">
                <Upload className="w-4 h-4 text-primary" />
                <span className="text-xs font-body text-foreground">{videoFile ? videoFile.name : "Upload video"}</span>
                <input type="file" accept="video/*" className="hidden" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} />
              </label>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="neon" type="submit" disabled={savingArticle}>
                <Save className="w-4 h-4 mr-2" />
                {savingArticle ? "Saving..." : editingId ? "Update Article" : "Publish Article"}
              </Button>
              {editingId && (
                <Button variant="portal" type="button" onClick={resetArticleForm}>
                  Cancel Edit
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-display text-sm font-bold text-foreground tracking-wider uppercase">Published Articles</h3>

        {articles.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground font-body">
            No articles yet — create the first transmission article above.
          </div>
        ) : (
          articles.map((article) => (
            <div key={article.id} className="rounded-xl border border-border bg-card p-4 md:p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-display text-base text-foreground">{article.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{article.intro}</p>
                  <p className="text-[11px] text-muted-foreground mt-2">
                    Updated {new Date(article.updatedAt || article.publishedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleEditArticle(article)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDeleteArticle(article.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ArticlesManager;
