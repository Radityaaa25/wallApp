import Navbar from "@/components/Navbar";
import ProfileSidebar from "@/components/ProfileSidebar";
import Wall from "@/components/Wall";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="page-shell">
        <div className="wall-layout">
          <ProfileSidebar />
          <Wall />
        </div>
        <footer className="page-footer">
          <span>© 2008 the wall</span>
          <nav aria-label="Footer navigation">
            <a href="#about">About</a>
            <a href="#privacy">Privacy</a>
            <a href="#help">Help</a>
          </nav>
        </footer>
      </main>
    </div>
  );
}
