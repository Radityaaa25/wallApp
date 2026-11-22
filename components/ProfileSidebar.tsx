export default function ProfileSidebar() {
  return (
    <aside className="left-column" aria-label="Profile information">
      <section className="panel profile-card">
        {/* Replace this local placeholder with your own profile photo. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="profile-photo"
          src="/profile-placeholder.svg"
          alt="Profile placeholder"
          width={202}
          height={202}
        />
        <h1 className="profile-name">Your Name</h1>
        <p className="profile-subtitle">Just another day online.</p>
      </section>
      <section className="panel information-panel" id="about">
        <div className="section-title">Information</div>
        <div className="information-content">
          <div className="information-row">
            <span className="information-icon" aria-hidden="true">
              ✦
            </span>
            <span>Making the most of today</span>
          </div>
          <div className="information-row">
            <span className="information-icon" aria-hidden="true">
              ⌂
            </span>
            <span>Somewhere, on the internet</span>
          </div>
          <div className="information-row">
            <span className="information-icon" aria-hidden="true">
              ♡
            </span>
            <span>Here to keep in touch</span>
          </div>
        </div>
      </section>
    </aside>
  );
}
