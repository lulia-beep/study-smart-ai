import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function PlaceholderPage({ title }: { title: string }) {
  return (
    <AppLayout>
      <div className="flex h-[60vh] flex-col items-center justify-center text-center">
        <h1 className="font-heading text-3xl font-bold text-foreground mb-2">{title}</h1>
        <p className="text-muted-foreground">Coming soon in Phase 2! 🚧</p>
      </div>
    </AppLayout>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/planner" element={<ProtectedRoute><PlaceholderPage title="Planner" /></ProtectedRoute>} />
            <Route path="/sessions" element={<ProtectedRoute><PlaceholderPage title="Study Sessions" /></ProtectedRoute>} />
            <Route path="/coach" element={<ProtectedRoute><PlaceholderPage title="AI Study Coach" /></ProtectedRoute>} />
            <Route path="/materials" element={<ProtectedRoute><PlaceholderPage title="Materials" /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><PlaceholderPage title="Analytics" /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
