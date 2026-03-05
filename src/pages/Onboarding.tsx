import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Clock, Target, Brain, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';

const steps = [
  { title: 'Your Subjects', description: 'What are you studying?', icon: BookOpen },
  { title: 'Study Habits', description: 'When do you study best?', icon: Clock },
  { title: 'Your Goals', description: 'What do you want to achieve?', icon: Target },
  { title: 'Learning Style', description: 'How do you learn best?', icon: Brain },
];

const studyTimes = ['Morning (6-12)', 'Afternoon (12-18)', 'Evening (18-24)', 'Late Night (0-6)'];
const focusDurations = [15, 25, 45, 60];
const goals = ['Improve grades', 'Prepare for exams', 'Learn new skills', 'Stay organized', 'Build consistency', 'Reduce stress'];
const learningStyles = ['Visual (diagrams, videos)', 'Reading/Writing', 'Auditory (lectures, podcasts)', 'Hands-on practice'];
const examStyles = ['Cramming before exam', 'Spaced repetition', 'Practice problems', 'Study groups'];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [subjectInput, setSubjectInput] = useState('');
  const [hardestSubjects, setHardestSubjects] = useState<string[]>([]);
  const [studyTime, setStudyTime] = useState('');
  const [focusDuration, setFocusDuration] = useState(25);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [learningStyle, setLearningStyle] = useState('');
  const [examStyle, setExamStyle] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const addSubject = () => {
    if (subjectInput.trim() && !subjects.includes(subjectInput.trim())) {
      setSubjects([...subjects, subjectInput.trim()]);
      setSubjectInput('');
    }
  };

  const toggleGoal = (goal: string) => {
    setSelectedGoals(prev =>
      prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]
    );
  };

  const toggleHardest = (subject: string) => {
    setHardestSubjects(prev =>
      prev.includes(subject) ? prev.filter(s => s !== subject) : [...prev, subject]
    );
  };

  const handleComplete = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Save study profile
      const { error: profileError } = await supabase.from('study_profiles').insert({
        user_id: user.id,
        preferred_study_time: studyTime,
        focus_duration_preference: focusDuration,
        hardest_subjects: hardestSubjects,
        study_goals: selectedGoals,
        learning_style: learningStyle,
        exam_prep_style: examStyle,
        main_subjects: subjects,
      });
      if (profileError) throw profileError;

      // Create subjects
      if (subjects.length > 0) {
        const colors = ['#F97316', '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6', '#EAB308'];
        const { error: subjectError } = await supabase.from('subjects').insert(
          subjects.map((s, i) => ({
            user_id: user.id,
            subject_name: s,
            color: colors[i % colors.length],
          }))
        );
        if (subjectError) throw subjectError;
      }

      // Mark onboarding complete
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('user_id', user.id);
      if (updateError) throw updateError;

      toast.success('Profile set up! Let\'s start studying! 🎉');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 0: return subjects.length > 0;
      case 1: return studyTime !== '';
      case 2: return selectedGoals.length > 0;
      case 3: return learningStyle !== '';
      default: return false;
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl gradient-warm">
            <Sparkles className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Let's personalize your experience</h1>
          <div className="mt-4 flex justify-center gap-2">
            {steps.map((_, i) => (
              <div key={i} className={`h-2 w-12 rounded-full transition-colors ${i <= step ? 'gradient-warm' : 'bg-muted'}`} />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-border/50 shadow-lg">
              <CardHeader>
                <CardTitle className="font-heading flex items-center gap-2 text-xl">
                  {(() => { const Icon = steps[step].icon; return <Icon className="h-5 w-5 text-primary" />; })()}
                  {steps[step].title}
                </CardTitle>
                <CardDescription>{steps[step].description}</CardDescription>
              </CardHeader>
              <CardContent>
                {step === 0 && (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a subject (e.g. Mathematics)"
                        value={subjectInput}
                        onChange={(e) => setSubjectInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSubject())}
                      />
                      <Button type="button" onClick={addSubject} size="sm" className="gradient-warm text-primary-foreground border-0">Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {subjects.map((s) => (
                        <Badge key={s} variant="secondary" className="cursor-pointer text-sm" onClick={() => setSubjects(subjects.filter(x => x !== s))}>
                          {s} ✕
                        </Badge>
                      ))}
                    </div>
                    {subjects.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">Which subjects are hardest? (optional)</Label>
                        <div className="flex flex-wrap gap-2">
                          {subjects.map((s) => (
                            <Badge
                              key={s}
                              variant={hardestSubjects.includes(s) ? 'default' : 'outline'}
                              className="cursor-pointer"
                              onClick={() => toggleHardest(s)}
                            >
                              {s}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label>When do you prefer to study?</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {studyTimes.map((time) => (
                          <Button
                            key={time}
                            type="button"
                            variant={studyTime === time ? 'default' : 'outline'}
                            className={studyTime === time ? 'gradient-warm text-primary-foreground border-0' : ''}
                            onClick={() => setStudyTime(time)}
                          >
                            {time}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>How long can you focus? (minutes)</Label>
                      <div className="grid grid-cols-4 gap-2">
                        {focusDurations.map((d) => (
                          <Button
                            key={d}
                            type="button"
                            variant={focusDuration === d ? 'default' : 'outline'}
                            className={focusDuration === d ? 'gradient-warm text-primary-foreground border-0' : ''}
                            onClick={() => setFocusDuration(d)}
                          >
                            {d}m
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-2">
                    <Label>Select your study goals (pick multiple)</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {goals.map((goal) => (
                        <Button
                          key={goal}
                          type="button"
                          variant={selectedGoals.includes(goal) ? 'default' : 'outline'}
                          className={`text-sm ${selectedGoals.includes(goal) ? 'gradient-warm text-primary-foreground border-0' : ''}`}
                          onClick={() => toggleGoal(goal)}
                        >
                          {goal}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label>How do you learn best?</Label>
                      <div className="grid gap-2">
                        {learningStyles.map((style) => (
                          <Button
                            key={style}
                            type="button"
                            variant={learningStyle === style ? 'default' : 'outline'}
                            className={`justify-start ${learningStyle === style ? 'gradient-warm text-primary-foreground border-0' : ''}`}
                            onClick={() => setLearningStyle(style)}
                          >
                            {style}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>How do you prepare for exams?</Label>
                      <div className="grid gap-2">
                        {examStyles.map((style) => (
                          <Button
                            key={style}
                            type="button"
                            variant={examStyle === style ? 'default' : 'outline'}
                            className={`justify-start ${examStyle === style ? 'gradient-warm text-primary-foreground border-0' : ''}`}
                            onClick={() => setExamStyle(style)}
                          >
                            {style}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        <div className="mt-4 flex justify-between">
          <Button
            variant="ghost"
            onClick={() => setStep(s => s - 1)}
            disabled={step === 0}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          {step < steps.length - 1 ? (
            <Button
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed()}
              className="gradient-warm text-primary-foreground border-0"
            >
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={!canProceed() || loading}
              className="gradient-warm text-primary-foreground border-0"
            >
              {loading ? 'Setting up...' : 'Start Studying! 🚀'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
