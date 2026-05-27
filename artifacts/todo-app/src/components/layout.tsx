import { Link, useLocation } from "wouter";
import { CheckSquare, BarChart2, Notebook, CalendarDays } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-card border-r border-border shrink-0 flex flex-col">
        <div className="p-6 md:p-8 flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
            <Notebook size={18} />
          </div>
          <h1 className="text-xl font-serif font-semibold text-foreground">Taskbook</h1>
        </div>

        <nav className="flex-1 px-4 md:px-6 pb-6 space-y-1">
          <Link href="/">
            <div data-testid="link-home" className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors cursor-pointer ${location === "/" ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"}`}>
              <CheckSquare size={18} />
              <span>Tasks</span>
            </div>
          </Link>
          <Link href="/calendar">
            <div data-testid="link-calendar" className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors cursor-pointer ${location === "/calendar" ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"}`}>
              <CalendarDays size={18} />
              <span>Calendar</span>
            </div>
          </Link>
          <Link href="/stats">
            <div data-testid="link-stats" className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors cursor-pointer ${location === "/stats" ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"}`}>
              <BarChart2 size={18} />
              <span>Statistics</span>
            </div>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
