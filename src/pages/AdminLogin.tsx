import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    } else {
      navigate("/admin");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm glow-border-orange rounded-2xl bg-card p-8 relative">
        <div className="scanline absolute inset-0 pointer-events-none opacity-10 rounded-2xl" />
        <div className="relative z-10">
          <div className="text-center mb-8">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow mx-auto mb-4" />
            <h1 className="font-display text-2xl font-black gradient-text-orange">ADMIN ACCESS</h1>
            <p className="text-muted-foreground text-xs font-display tracking-wider mt-2">AUTHORIZED PERSONNEL ONLY</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="font-display text-xs tracking-wider text-muted-foreground uppercase">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 bg-muted border-border" required />
            </div>
            <div>
              <Label htmlFor="password" className="font-display text-xs tracking-wider text-muted-foreground uppercase">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 bg-muted border-border" required />
            </div>
            <Button variant="neon" className="w-full" type="submit" disabled={loading}>
              {loading ? "Authenticating..." : "Enter Control Room"}
            </Button>
          </form>
          <a href="/" className="block text-center mt-6 text-xs text-muted-foreground hover:text-primary transition-colors font-display tracking-wider">
            ← Back to Site
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
