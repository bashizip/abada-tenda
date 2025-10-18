import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import TaskDetail from "./pages/TaskDetail";
import Processes from "./pages/Processes";
import ProcessDetail from "./pages/ProcessDetail";
import ProcessUpload from "./pages/ProcessUpload";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./components/AuthProvider";
import { useAuth } from "./hooks/useAuth";

const queryClient = new QueryClient();

// Protected Route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/" element={<Navigate to="/tasks" replace />} />
    <Route
      path="/tasks"
      element={
        <ProtectedRoute>
          <Tasks />
        </ProtectedRoute>
      }
    />
    <Route
      path="/tasks/:id"
      element={
        <ProtectedRoute>
          <TaskDetail />
        </ProtectedRoute>
      }
    />
    <Route
      path="/processes"
      element={
        <ProtectedRoute>
          <Processes />
        </ProtectedRoute>
      }
    />
    <Route
      path="/processes/:id"
      element={
        <ProtectedRoute>
          <ProcessDetail />
        </ProtectedRoute>
      }
    />
    <Route
      path="/processes/upload"
      element={
        <ProtectedRoute>
          <ProcessUpload />
        </ProtectedRoute>
      }
    />
    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      }
    />
    <Route
      path="/history"
      element={
        <ProtectedRoute>
          <Navigate to="/tasks" replace />
        </ProtectedRoute>
      }
    />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
