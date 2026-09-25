import { Link, useLocation } from "wouter";
import { CheckSquare, BarChart2, Notebook, CalendarDays, LogOut, User, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "../context/auth-context";
import { Button } from "@/components/ui/button";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-card border-b md:border-b-0 md:border-r border-border shrink-0 flex flex-col justify-between">
        <div>
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-md">
                <Notebook size={20} />
              </div>
              <h1 className="text-xl font-serif font-bold text-foreground">Taskbook</h1>
            </div>
          </div>

          <nav className="px-4 space-y-1">
            <Link href="/">
              <div
                data-testid="link-home"
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                  location === "/"
                    ? "bg-primary text-primary-foreground font-medium shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                }`}
              >
                <CheckSquare size={18} />
                <span>Tasks</span>
              </div>
            </Link>
            <Link href="/calendar">
              <div
                data-testid="link-calendar"
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                  location === "/calendar"
                    ? "bg-primary text-primary-foreground font-medium shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                }`}
              >
                <CalendarDays size={18} />
                <span>Calendar</span>
              </div>
            </Link>
            <Link href="/stats">
              <div
                data-testid="link-stats"
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                  location === "/stats"
                    ? "bg-primary text-primary-foreground font-medium shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                }`}
              >
                <BarChart2 size={18} />
                <span>Statistics</span>
              </div>
            </Link>
          </nav>
        </div>

        {/* User Footer / Auth status */}
        <div className="p-4 m-4 rounded-2xl bg-muted/40 border border-border/50">
          {isAuthenticated && user ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{user.username}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="w-full rounded-xl justify-center gap-2 text-xs font-medium hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium mb-1">Account & Sync</p>
              <Link href="/login">
                <Button size="sm" className="w-full rounded-xl gap-2 text-xs font-medium mb-1.5">
                  <LogIn size={14} />
                  <span>Sign In</span>
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="outline" size="sm" className="w-full rounded-xl gap-2 text-xs font-medium">
                  <UserPlus size={14} />
                  <span>Register</span>
                </Button>
              </Link>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
