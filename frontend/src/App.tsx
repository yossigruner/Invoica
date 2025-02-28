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
import { PayPage } from "./pages/PayPage";

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
const Layout = ({ children, includeNav = true }: { children: React.ReactNode, includeNav?: boolean }) => (
  <div className="flex flex-col min-h-screen">
    {includeNav && <Navbar />}
    <main className="flex-grow">{children}</main>
    {includeNav && <Footer />}
  </div>
);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Layout includeNav={true}><Login /></Layout>} />
              <Route path="/register" element={<Layout includeNav={true}><Register /></Layout>} />
              <Route path="/forgot-password" element={<Layout includeNav={true}><ForgotPassword /></Layout>} />
              <Route path="/about" element={<Layout includeNav={true}><AboutUs /></Layout>} />
              <Route path="/contact" element={<Layout includeNav={true}><ContactUs /></Layout>} />
              <Route path="/faq" element={<Layout includeNav={true}><Faq /></Layout>} />
              <Route path="/pay/:id" element={<Layout includeNav={false}><PayPage /></Layout>} />

              {/* Protected routes */}
              <Route path="/" element={<ProtectedRoute><Layout includeNav={true}><Invoices /></Layout></ProtectedRoute>} />
              <Route path="/invoices" element={<ProtectedRoute><Layout includeNav={true}><Invoices /></Layout></ProtectedRoute>} />
              <Route path="/invoices/create" element={<ProtectedRoute><Layout includeNav={true}><CreateInvoice /></Layout></ProtectedRoute>} />
              <Route path="/invoices/:id/edit" element={<ProtectedRoute><Layout includeNav={true}><CreateInvoice /></Layout></ProtectedRoute>} />
              <Route path="/customers" element={<ProtectedRoute><Layout includeNav={true}><Customers /></Layout></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Layout includeNav={true}><Profile /></Layout></ProtectedRoute>} />
              <Route path="/profile/wizard" element={<ProtectedRoute><Layout includeNav={true}><ProfileWizard /></Layout></ProtectedRoute>} />
              
              {/* 404 route */}
              <Route path="*" element={<Layout includeNav={true}><NotFound /></Layout>} />
            </Routes>
            <Toaster />
            <Sonner />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
