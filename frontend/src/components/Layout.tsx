import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Box, Cog, Info, LayoutGrid, Menu, ScanLine, TrendingUp, User, X } from "lucide-react";
import { Pill } from "./ui";
import { useApp } from "../lib/AppContext";

const NAV = [
  { to: "/", label: "Overview", crumb: "Overview", icon: LayoutGrid },
  { to: "/detection", label: "Object Detection", crumb: "Object detection", icon: ScanLine },
  { to: "/conveyor", label: "Conveyor System", crumb: "Conveyor system", icon: Cog },
  { to: "/performance", label: "Model Performance", crumb: "Model performance", icon: TrendingUp },
  { to: "/about", label: "About Project", crumb: "About project", icon: Info },
];

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { backendOnline, modelLoaded } = useApp();
  return (
    <div className="flex h-full flex-col bg-sidebar px-3 pb-5 pt-7">
      <div className="px-3">
        <div className="flex items-center gap-2.5">
          <Box className="text-brand" size={26} strokeWidth={1.6} />
          <span className="text-[19px] font-semibold tracking-wide">KHILONA</span>
        </div>
        <p className="mt-2 text-[9px] uppercase tracking-[0.1em] text-faint">Smart sorting system</p>
        <div className="mt-6 h-px bg-line" />
        <p className="mb-3 mt-6 text-[10px] uppercase tracking-[0.08em] text-faint">Workspace</p>
      </div>
      <nav className="flex flex-col gap-1" aria-label="Primary">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === "/"} onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg border-l-2 px-3 py-2.5 text-[13px] transition-colors ${
                isActive ? "border-brand bg-brand/20 font-medium text-ink" : "border-transparent text-muted hover:bg-raised hover:text-ink"}`}>
            <Icon size={16} strokeWidth={1.6} />{label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto space-y-4 px-1">
        <div className="rounded-lg border border-line bg-raised/70 p-3.5 text-[11px] text-muted">
          <p className="eyebrow mb-1.5">Simulation workspace</p>
          Intelligence in software.<br />No hardware connected.
        </div>
        <div className="space-y-2 border-t border-line px-2 pt-4 text-[11px]">
          <p className="flex items-center gap-2"><i className={`h-1.5 w-1.5 rounded-full ${backendOnline ? "bg-ok" : "bg-yellow"}`} />{backendOnline ? "Backend connected" : "Workspace ready"}</p>
          <p className="flex items-center gap-2 text-muted"><i className={`h-1.5 w-1.5 rounded-full ${modelLoaded ? "bg-ok" : "bg-yellow"}`} />{modelLoaded ? "Model connected" : "Model not connected"}</p>
        </div>
        <div className="flex justify-between px-2 text-[10px] text-faint"><span>KHILONA</span><span>v1.0.0</span></div>
      </div>
    </div>
  );
}

export default function Layout() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { backendOnline } = useApp();
  const crumb = NAV.find((n) => n.to === pathname)?.crumb ?? "";
  useEffect(() => { setOpen(false); window.scrollTo(0, 0); }, [pathname]);

  return (
    <div className="min-h-full">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[240px] border-r border-line lg:block"><Sidebar /></aside>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-[260px] border-r border-line"><Sidebar onNavigate={() => setOpen(false)} /></aside>
        </div>
      )}
      <div className="flex min-h-screen min-w-0 flex-col lg:ml-[240px]">
        <header className="sticky top-0 z-20 flex h-[60px] items-center justify-between border-b border-line bg-app/90 px-5 backdrop-blur sm:px-8">
          <div className="flex items-center gap-3 text-[11px]">
            <button className="rounded-md p-1.5 text-muted hover:bg-raised lg:hidden" onClick={() => setOpen(true)} aria-label="Open navigation">
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
            <span className="hidden uppercase tracking-wider text-faint sm:inline">Workspace</span>
            <span className="text-[12px] text-ink"><span className="mr-2 text-faint">/</span>{crumb}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="hidden sm:inline-flex"><Pill tone="blue">Simulation mode</Pill></span>
            <Pill tone={backendOnline ? "green" : "yellow"}>{backendOnline ? "Backend online" : "Backend offline"}</Pill>
            <span className="grid h-9 w-9 place-items-center rounded-full border border-line bg-raised text-muted" aria-hidden="true"><User size={15} /></span>
          </div>
        </header>
        <main className="flex-1 px-5 py-8 sm:px-8"><Outlet /></main>
        <footer className="flex flex-col gap-1 border-t border-line px-5 py-5 text-[10px] uppercase tracking-wider text-faint sm:flex-row sm:justify-between sm:px-8">
          <span>KHILONA / Smart Object Sorting System</span>
          <span>Custom CNN • 3 color classes • Software simulation</span>
        </footer>
      </div>
    </div>
  );
}
