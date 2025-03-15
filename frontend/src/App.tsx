import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "sonner";
import Login from "@/pages/Login";
import { Register } from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import AboutUs from "@/pages/AboutUs";
import ContactUs from "@/pages/ContactUs";
import Faq from "@/pages/Faq";
import { PayPage } from "@/pages/PayPage";
import { Layout } from "@/components/layout/Layout";
import { PrivateRoute } from "@/components/PrivateRoute";
import { AdminRoute } from "@/components/AdminRoute";
import Invoices from "@/pages/Invoices";
import CreateInvoice from "@/pages/CreateInvoice";
import Customers from "@/pages/Customers";
import Profile from "@/pages/Profile";
import UsersPage from "@/pages/admin/UsersPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <Toaster position="top-center" richColors />
          <Routes>
            {/* Public Routes without Layout */}
            <Route path="/pay/:invoiceId" element={<PayPage />} />

            {/* Public Routes with Layout */}
            <Route element={<Layout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/faq" element={<Faq />} />
            </Route>

            {/* Protected Routes with Layout */}
            <Route element={<PrivateRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<Invoices />} />
                <Route path="/invoices" element={<Invoices />} />
                <Route path="/invoices/create" element={<CreateInvoice />} />
                <Route path="/invoices/:id/edit" element={<CreateInvoice />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/profile" element={<Profile />} />
                
                {/* Admin Routes */}
                <Route element={<AdminRoute />}>
                  <Route path="/admin/users" element={<UsersPage />} />
                </Route>
              </Route>
            </Route>
          </Routes>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
