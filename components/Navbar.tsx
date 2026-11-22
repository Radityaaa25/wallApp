import Link from "next/link";

export default function Navbar() {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link className="wordmark" href="/" aria-label="the wall home">
          facebook
        </Link>
        <nav className="top-links" aria-label="Main navigation">
          <a href="#home">Home</a>
          <a href="#friends">Friends</a>
          <a className="nav-user" href="#profile">
            Profile
          </a>
        </nav>
      </div>
    </header>
  );
}
