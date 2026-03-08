import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Menu, X, Instagram, Twitter, Music } from "lucide-react";

const NAV_LINKS = [
  { href: "#event", label: "Event" },
  { href: "#broadcast", label: "Broadcast" },
  { href: "#style", label: "Style" },
  { href: "#archive", label: "Archive" },
  { href: "#mission", label: "Mission" },
  { href: "#signal", label: "Signal" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/70 backdrop-blur-xl border-b border-border/40"
    >
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
          <span className="font-display font-bold text-sm tracking-[0.15em] text-foreground">
            BPM<span className="text-primary"> CTRL</span>
          </span>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6 text-xs font-display tracking-[0.15em] text-muted-foreground uppercase">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-primary transition-colors">
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {/* Social icons */}
          <div className="hidden sm:flex items-center gap-2">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors p-1.5" aria-label="Instagram">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors p-1.5" aria-label="Twitter">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors p-1.5" aria-label="TikTok">
              <Music className="w-4 h-4" />
            </a>
          </div>

           <a href="#signal" className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-primary/30 text-primary text-xs font-display tracking-wider hover:bg-primary/10 transition-colors">
             <Zap className="w-3 h-3" />
             Join
           </a>

           {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-1.5 text-muted-foreground hover:text-primary transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="px-4 py-4 flex flex-col gap-3">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-display tracking-[0.15em] text-muted-foreground uppercase hover:text-primary transition-colors py-2 border-b border-border/20"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
