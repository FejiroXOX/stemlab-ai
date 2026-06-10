import { Link, useRouterState } from "@tanstack/react-router";
import {
  Atom,
  BarChart3,
  Beaker,
  BrainCircuit,
  GraduationCap,
  LayoutDashboard,
  Menu,
  Moon,
  Rocket,
  Sun,
  Trophy,
  Zap,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/experiments/chemistry", label: "Chemistry", icon: Beaker },
  { to: "/experiments/circuit", label: "Circuits", icon: Zap },
  { to: "/experiments/projectile", label: "Projectile", icon: Rocket },
  { to: "/tutor", label: "AI Tutor", icon: BrainCircuit },
  { to: "/quiz", label: "Quizzes", icon: GraduationCap },
  { to: "/progress", label: "Progress", icon: BarChart3 },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative flex min-h-screen w-full">
      {/* Sidebar */}
      <aside
        className={cn(
          "glass-strong fixed inset-y-0 left-0 z-40 flex w-64 flex-col gap-1 border-r border-border/60 p-4 transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <Link to="/" className="mb-4 flex items-center gap-2 px-2 py-2" onClick={() => setOpen(false)}>
          <div className="relative">
            <div className="absolute inset-0 animate-pulse-glow rounded-xl" />
            <div className="relative grid h-10 w-10 place-items-center rounded-xl" style={{ background: "var(--gradient-hero)" }}>
              <Atom className="h-6 w-6 text-white" />
            </div>
          </div>
          <div>
            <div className="text-base font-bold tracking-tight">STEMLab <span className="gradient-text">AI</span></div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Virtual Laboratory</div>
          </div>
        </Link>

        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = pathname === to || (to !== "/" && pathname.startsWith(to));
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  active
                    ? "bg-primary/15 text-foreground glow"
                    : "text-muted-foreground hover:bg-accent/40 hover:text-foreground",
                )}
              >
                <Icon className={cn("h-4.5 w-4.5 transition", active ? "text-primary" : "")} />
                <span>{label}</span>
                {active && <span className="absolute right-3 h-1.5 w-1.5 rounded-full bg-primary" />}
              </Link>
            );
          })}
        </nav>

        <div className="glass mt-2 rounded-xl p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Trophy className="h-3.5 w-3.5 text-[color:var(--engineering)]" />
            Today's streak
          </div>
          <div className="mt-1 text-xl font-bold gradient-text">🔥 4 days</div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-h-screen flex-1 flex-col lg:pl-64">
        <header className="glass sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/60 px-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen((v) => !v)}>
              <Menu className="h-5 w-5" />
            </Button>
            <div className="text-sm text-muted-foreground">Welcome back, <span className="font-medium text-foreground">Explorer</span></div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
              {theme === "dark" ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </Button>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>

      {open && (
        <button
          aria-label="Close menu"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-background/60 backdrop-blur-sm lg:hidden"
        />
      )}
    </div>
  );
}
