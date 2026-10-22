import { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation, Link } from "react-router-dom";
import { LayoutDashboard, BookOpen, Shuffle, ClipboardCheck, Bookmark, History, Settings, Menu, X, Play } from "lucide-react";
import { useStore } from "../hooks/useStore.jsx";

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/weeks", label: "Weekwise Practice", icon: BookOpen },
  { to: "/random", label: "Random Quiz", icon: Shuffle },
  { to: "/full", label: "Full Test", icon: ClipboardCheck },
  { to: "/bookmarks", label: "Bookmarks", icon: Bookmark },
  { to: "/history", label: "Results & History", icon: History },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Layout() {
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const { state } = useStore();
  useEffect(() => {
    setOpen(false);
    window.scrollTo(0, 0);
  }, [loc.pathname]);
  const inQuiz = loc.pathname === "/quiz";

  return (
    <div className="shell">
      <a href="#main" className="skip">Skip to content</a>
      <header className="topbar">
        <button className="icon-btn menu-btn" onClick={() => setOpen(!open)} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
        <Link to="/" className="brand">
          <span className="brand-mark" aria-hidden="true">AI</span>
          <span className="brand-text">Industrial &amp; Management<small>Quiz practice</small></span>
        </Link>
        {state.activeSession && !inQuiz && (
          <Link to="/quiz" className="btn btn-primary btn-sm resume">
            <Play size={14} /> Resume quiz
          </Link>
        )}
      </header>
      <nav className={`sidebar ${open ? "open" : ""}`} aria-label="Main">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => (isActive ? "nav active" : "nav")}>
            <Icon size={18} /> {label}
          </NavLink>
        ))}
        <p className="side-note">Practice material for the NPTEL course “Artificial Intelligence in Industrial and Management”. Independent study tool, not affiliated with NPTEL.</p>
      </nav>
      {open && <div className="scrim" onClick={() => setOpen(false)} />}
      <main id="main" className="content">
        <Outlet />
      </main>
    </div>
  );
}
