import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Footer } from "./components/layout/Footer";
import { Navbar } from "./components/layout/Navbar";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Invoices from "./pages/Invoices";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import CreateInvoice from "./pages/CreateInvoice";
import Customers from "./pages/Customers";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import ProfileWizard from "./pages/ProfileWizard";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import Faq from "./pages/Faq";

const queryClient = new QueryClient();

// Protected Route component that checks for authentication
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Public Route component that redirects to home if already authenticated
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Layout component that includes Navbar and Footer
const Layout = ({ children, includeFooter = true }: { children: React.ReactNode; includeFooter?: boolean }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      {includeFooter && <Footer />}
    </div>
  );
};

const AppContent = () => {
  return (
    <Routes>
      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <Invoices />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/customers"
        element={
          <ProtectedRoute>
            <Layout>
              <Customers />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-invoice"
        element={
          <ProtectedRoute>
            <Layout>
              <CreateInvoice />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/edit-invoice/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <CreateInvoice />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Layout>
              <Profile />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile-wizard"
        element={
          <ProtectedRoute>
            <Layout includeFooter={false}>
              <ProfileWizard />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Layout includeFooter={false}>
              <Login />
            </Layout>
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Layout includeFooter={false}>
              <Register />
            </Layout>
          </PublicRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <Layout includeFooter={false}>
              <ForgotPassword />
            </Layout>
          </PublicRoute>
        }
      />

      {/* Public Information Pages */}
      <Route
        path="/about"
        element={
          <Layout>
            <AboutUs />
          </Layout>
        }
      />
      <Route
        path="/contact"
        element={
          <Layout>
            <ContactUs />
          </Layout>
        }
      />
      <Route
        path="/faq"
        element={
          <Layout>
            <Faq />
          </Layout>
        }
      />

      {/* 404 Page */}
      <Route
        path="*"
        element={
          <Layout>
            <NotFound />
          </Layout>
        }
      />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
          <Toaster />
          <Sonner />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
