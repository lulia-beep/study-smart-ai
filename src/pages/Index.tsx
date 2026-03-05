import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import {
  BookOpen, Clock, Target, CheckCircle2, Calendar,
  Sparkles, TrendingUp, Plus
} from 'lucide-react';
import { format } from 'date-fns';

interface DashboardData {
  profile: { name: string; onboarding_completed: boolean } | null;
  tasks: any[];
  events: any[];
  sessions: any[];
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData>({ profile: null, tasks: [], events: [], sessions: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadDashboard();
  }, [user]);

  const loadDashboard = async () => {
    if (!user) return;

    const [profileRes, tasksRes, eventsRes, sessionsRes] = await Promise.all([
      supabase.from('profiles').select('name, onboarding_completed').eq('user_id', user.id).single(),
      supabase.from('tasks').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
      supabase.from('events').select('*').eq('user_id', user.id).gte('date', new Date().toISOString()).order('date').limit(5),
      supabase.from('study_sessions').select('*').eq('user_id', user.id).order('start_time', { ascending: false }).limit(5),
    ]);

    if (profileRes.data && !profileRes.data.onboarding_completed) {
      navigate('/onboarding');
      return;
    }

    setData({
      profile: profileRes.data,
      tasks: tasksRes.data || [],
      events: eventsRes.data || [],
      sessions: sessionsRes.data || [],
    });
    setLoading(false);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex h-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </AppLayout>
    );
  }

  const completedTasks = data.tasks.filter(t => t.status === 'completed').length;
  const totalStudyMinutes = data.sessions.reduce((acc, s) => acc + (s.duration || 0), 0);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading text-2xl font-bold text-foreground md:text-3xl">
                Hey, {data.profile?.name || 'Student'}! 👋
              </h1>
              <p className="text-muted-foreground">Here's your study overview for today</p>
            </div>
            <Button className="gradient-warm text-primary-foreground border-0 hidden md:flex" onClick={() => navigate('/sessions')}>
              <Plus className="mr-2 h-4 w-4" /> Start Session
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Tasks Completed', value: completedTasks, icon: CheckCircle2, color: 'text-success' },
            { label: 'Study Time', value: `${totalStudyMinutes}m`, icon: Clock, color: 'text-secondary' },
            { label: 'Upcoming Events', value: data.events.length, icon: Calendar, color: 'text-primary' },
            { label: 'Sessions', value: data.sessions.length, icon: TrendingUp, color: 'text-study-purple' },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="glass-card">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className={`rounded-xl bg-muted p-2.5 ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold font-heading text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Tasks */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="font-heading text-lg">Recent Tasks</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/planner')}>View all</Button>
              </CardHeader>
              <CardContent>
                {data.tasks.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    <Target className="mx-auto mb-2 h-8 w-8 opacity-50" />
                    <p>No tasks yet. Add your first one!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data.tasks.map(task => (
                      <div key={task.id} className="flex items-center justify-between rounded-lg border border-border/50 p-3">
                        <div className="flex items-center gap-3">
                          <div className={`h-2 w-2 rounded-full ${task.status === 'completed' ? 'bg-success' : task.priority === 'high' ? 'bg-destructive' : 'bg-warning'}`} />
                          <span className={`text-sm ${task.status === 'completed' ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                            {task.title}
                          </span>
                        </div>
                        <Badge variant={task.status === 'completed' ? 'secondary' : 'outline'} className="text-xs">
                          {task.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Upcoming Events */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="font-heading text-lg">Upcoming Events</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/planner')}>View all</Button>
              </CardHeader>
              <CardContent>
                {data.events.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    <Calendar className="mx-auto mb-2 h-8 w-8 opacity-50" />
                    <p>No upcoming events</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data.events.map(event => (
                      <div key={event.id} className="flex items-center justify-between rounded-lg border border-border/50 p-3">
                        <div>
                          <p className="text-sm font-medium text-foreground">{event.title}</p>
                          <p className="text-xs text-muted-foreground">{format(new Date(event.date), 'MMM d, yyyy')}</p>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            event.event_type === 'exam' ? 'border-destructive text-destructive' :
                            event.event_type === 'assignment' ? 'border-warning text-warning' :
                            'border-secondary text-secondary'
                          }`}
                        >
                          {event.event_type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* AI Coach CTA */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="gradient-cool border-0 text-primary-foreground">
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-primary-foreground/20 p-3">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold">AI Study Coach</h3>
                  <p className="text-sm opacity-90">Get personalized study tips and help</p>
                </div>
              </div>
              <Button variant="secondary" onClick={() => navigate('/coach')} className="bg-primary-foreground/20 text-primary-foreground border-0 hover:bg-primary-foreground/30">
                Chat Now
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Mobile FAB */}
        <div className="fixed bottom-20 right-4 md:hidden">
          <Button
            className="h-14 w-14 rounded-full gradient-warm text-primary-foreground border-0 shadow-lg"
            onClick={() => navigate('/sessions')}
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
