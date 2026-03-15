import { motion } from "framer-motion";
import { useSectionContent, getContentJSON, getContentValue } from "@/hooks/useSiteContent";

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

const isEmbeddable = (url: string) => {
  return url.includes("youtube.com") || url.includes("youtu.be") || url.includes("vimeo.com");
};

const getEmbedUrl = (url: string) => {
  if (url.includes("youtube.com/watch")) {
    const id = new URL(url).searchParams.get("v");
    return id ? `https://www.youtube.com/embed/${id}` : url;
  }

  if (url.includes("youtu.be/")) {
    const id = url.split("youtu.be/")[1]?.split("?")[0];
    return id ? `https://www.youtube.com/embed/${id}` : url;
  }

  if (url.includes("vimeo.com/")) {
    const id = url.split("vimeo.com/")[1]?.split("?")[0];
    return id ? `https://player.vimeo.com/video/${id}` : url;
  }

  return url;
};

const ArticlesSection = () => {
  const { data: content } = useSectionContent("articles");

  const tagline = getContentValue(content, "articles_tagline", "Field Notes");
  const title = getContentValue(content, "articles_title", "TRANSMISSION ARTICLES");
  const description = getContentValue(
    content,
    "articles_description",
    "Long-form signal drops with structured media layouts managed from admin."
  );

  const template = getContentJSON<ArticleTemplate>(
    content,
    "articles_template",
    [DEFAULT_TEMPLATE]
  )[0] || DEFAULT_TEMPLATE;

  const articles = getContentJSON<ArticleItem>(content, "articles_items", []);

  return (
    <section id="articles" className="py-24 px-4 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-orange-deep/5 to-background" />

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-4"
        >
          <span className="text-xs font-display tracking-[0.4em] text-primary uppercase">{tagline}</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-center font-display text-4xl md:text-6xl font-black gradient-text-orange mb-6"
        >
          {title}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-center text-muted-foreground font-body max-w-2xl mx-auto mb-14"
        >
          {description}
        </motion.p>

        {articles.length === 0 ? (
          <div className="glow-border-orange rounded-2xl bg-card p-8 text-center">
            <p className="text-muted-foreground font-body">
              No articles published yet. Add your first transmission article from the admin panel.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {articles.map((article, index) => (
              <motion.article
                key={article.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="glow-border-orange rounded-2xl bg-card p-6 md:p-10 relative overflow-hidden"
              >
                <div className="scanline absolute inset-0 pointer-events-none opacity-10 rounded-2xl" />
                <div className="relative z-10 space-y-6">
                  <header>
                    <p className="text-[10px] font-display tracking-[0.25em] text-primary uppercase mb-2">
                      ARTICLE #{index + 1} · {new Date(article.updatedAt || article.publishedAt).toLocaleDateString()}
                    </p>
                    <h3 className="font-display text-2xl md:text-4xl font-black text-foreground mb-3">{article.title}</h3>
                    <p className="text-muted-foreground font-body text-base md:text-lg">{article.intro}</p>
                  </header>

                  {article.heroImage && (
                    <div
                      className="rounded-xl overflow-hidden bg-muted"
                      style={{ aspectRatio: `${template.heroWidth || 16}/${template.heroHeight || 9}` }}
                    >
                      <img
                        src={article.heroImage}
                        alt={`${article.title} hero image`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}

                  <div className="space-y-4">
                    {article.body
                      .split(/\n{2,}/)
                      .filter(Boolean)
                      .map((paragraph, paragraphIndex) => (
                        <p key={`${article.id}-paragraph-${paragraphIndex}`} className="text-foreground/90 font-body leading-relaxed">
                          {paragraph}
                        </p>
                      ))}
                  </div>

                  {article.galleryImages?.length > 0 && (
                    <div className={`grid grid-cols-1 ${article.galleryImages.length > 1 ? "md:grid-cols-2" : ""} gap-4`}>
                      {article.galleryImages.slice(0, template.galleryCount || 2).map((image, imageIndex) => (
                        <div
                          key={`${article.id}-gallery-${imageIndex}`}
                          className="rounded-xl overflow-hidden bg-muted"
                          style={{ aspectRatio: `${template.galleryWidth || 1}/${template.galleryHeight || 1}` }}
                        >
                          <img
                            src={image}
                            alt={`${article.title} gallery image ${imageIndex + 1}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {(article.audioUrl || article.videoUrl) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {article.audioUrl && (
                        <div className="rounded-xl border border-border p-4 bg-muted/30">
                          <p className="text-xs font-display tracking-wider text-primary uppercase mb-3">Article Audio</p>
                          <audio controls className="w-full" preload="none">
                            <source src={article.audioUrl} />
                          </audio>
                        </div>
                      )}

                      {article.videoUrl && (
                        <div className="rounded-xl border border-border p-4 bg-muted/30">
                          <p className="text-xs font-display tracking-wider text-primary uppercase mb-3">Article Video</p>
                          {isEmbeddable(article.videoUrl) ? (
                            <div className="aspect-video rounded-lg overflow-hidden">
                              <iframe
                                src={getEmbedUrl(article.videoUrl)}
                                className="w-full h-full"
                                allowFullScreen
                                loading="lazy"
                                title={`${article.title} video`}
                              />
                            </div>
                          ) : (
                            <video controls className="w-full rounded-lg" preload="none">
                              <source src={article.videoUrl} />
                            </video>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ArticlesSection;
