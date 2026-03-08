import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import BadgeGrid from "@/components/BadgeGrid";
import UserStats from "@/components/UserStats";
import UpcomingEvents from "@/components/UpcomingEvents";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <div id="badges">
        <BadgeGrid />
      </div>
      <div id="progress">
        <UserStats />
      </div>
      <div id="events">
        <UpcomingEvents />
      </div>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-muted-foreground text-sm font-body">
            © 2026 Rave Collective. Dance. Earn. Ascend.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
