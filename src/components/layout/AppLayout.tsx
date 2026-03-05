import { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard, Calendar, Timer, Sparkles,
  FolderOpen, BarChart3, LogOut, BookOpen
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { label: 'Planner', icon: Calendar, path: '/planner' },
  { label: 'Sessions', icon: Timer, path: '/sessions' },
  { label: 'AI Coach', icon: Sparkles, path: '/coach' },
  { label: 'Materials', icon: FolderOpen, path: '/materials' },
  { label: 'Analytics', icon: BarChart3, path: '/analytics' },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top bar - desktop */}
      <header className="hidden border-b border-border/50 bg-card/80 backdrop-blur-sm md:block">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-warm">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-heading text-xl font-bold text-foreground">StudyFlow</span>
          </div>
          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant={location.pathname === item.path ? 'default' : 'ghost'}
                size="sm"
                className={location.pathname === item.path ? 'gradient-warm text-primary-foreground border-0' : ''}
                onClick={() => navigate(item.path)}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            ))}
            <Button variant="ghost" size="sm" onClick={signOut} className="ml-2">
              <LogOut className="h-4 w-4" />
            </Button>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="container flex-1 py-6 pb-20 md:pb-6">
        {children}
      </main>

      {/* Bottom nav - mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-card/95 backdrop-blur-sm md:hidden">
        <div className="flex items-center justify-around py-2">
          {navItems.slice(0, 5).map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-xs transition-colors ${
                location.pathname === item.path
                  ? 'text-primary font-medium'
                  : 'text-muted-foreground'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
