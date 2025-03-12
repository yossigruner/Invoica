import { useState, useCallback, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });

  const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await register(formData);
      toast.success("Account created successfully");
      navigate("/");
    } catch (error) {
      if (error instanceof Error) {
        console.error('Registration error:', error.message);
        if (error.message.includes('already exists')) {
          setError("Email already exists. Please use a different email.");
        } else {
          setError(error.message);
        }
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [formData, register, navigate]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError(null);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] p-4">
      <div className="w-full max-w-[1100px] min-h-[600px] flex flex-col md:flex-row bg-white rounded-[32px] shadow-sm overflow-hidden">
        {/* Register Form Section */}
        <div className="w-full md:w-[45%] p-6 sm:p-8 md:p-12 flex flex-col">
          <div className="mb-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="relative w-12 h-12 flex items-center justify-center">
                {/* Outer glow */}
                <div className="absolute w-[200%] h-[200%] rounded-full bg-[#7C5CFC] opacity-5"></div>
                <div className="absolute w-[150%] h-[150%] rounded-full bg-[#7C5CFC] opacity-10"></div>
                {/* Main circle */}
                <div className="relative w-full h-full rounded-full bg-[#7C5CFC]"></div>
              </div>
            </div>
            <h1 className="text-2xl sm:text-[28px] font-semibold text-[#1A1A1A] mb-2">Create an account</h1>
            <p className="text-sm sm:text-[15px] text-[#666666]">Enter your details to get started.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-5" noValidate>
            {error && (
              <div className="px-4 py-3 bg-[#FEF2F2] text-[#EF4444] text-[14px] rounded-lg">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="firstName" className="text-sm font-medium">First name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="Enter your first name"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="h-11"
                  disabled={loading}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lastName" className="text-sm font-medium">Last name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Enter your last name"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="h-11"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
                className="h-11"
                autoComplete="email"
                disabled={loading}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                required
                className="h-11"
                autoComplete="new-password"
                disabled={loading}
              />
            </div>

            <div className="flex-1 flex flex-col justify-end space-y-5">
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-[#7C5CFC] hover:bg-[#7C5CFC]/90 text-white"
              >
                {loading ? "Creating account..." : "Create account"}
              </Button>

              <p className="text-center text-sm text-[#666666]">
                Already have an account?{" "}
                <Link to="/login" className="text-[#7C5CFC] hover:text-[#7C5CFC]/80 transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Image Section */}
        <div className="hidden md:block w-[55%] bg-[#7C5CFC] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#7C5CFC] to-[#9F7AFF] opacity-90"></div>
          <div className="absolute inset-0 flex items-center justify-center p-12">
            <div className="text-center text-white">
              <h2 className="text-3xl font-bold mb-4">Welcome to Invoica</h2>
              <p className="text-lg opacity-90">
                Create professional invoices in minutes and get paid faster.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
