import { useState, useCallback, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function Register() {
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
  }, [formData, register]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError(null);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
      <div className="w-full max-w-[1100px] min-h-[600px] flex bg-white rounded-[32px] shadow-sm overflow-hidden">
        {/* Register Form Section */}
        <div className="w-[45%] p-12 flex flex-col">
          <div className="mb-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-14 h-14 rounded-full bg-[#7C5CFC] flex items-center justify-center">
                <div className="w-3.5 h-3.5 rounded-full bg-white"></div>
              </div>
            </div>
            <h1 className="text-[28px] font-semibold text-[#1A1A1A] mb-2">Create an account</h1>
            <p className="text-[15px] text-[#666666]">Enter your details to get started.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-5" noValidate>
            {error && (
              <div className="px-4 py-3 bg-[#FEF2F2] text-[#EF4444] text-[14px] rounded-lg">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="firstName" className="block text-[15px] font-medium text-[#1A1A1A]">
                  First name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="Enter your first name"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full h-12 px-4 text-[15px] rounded-xl border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#7C5CFC] focus:border-transparent placeholder:text-[#999999]"
                  disabled={loading}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="lastName" className="block text-[15px] font-medium text-[#1A1A1A]">
                  Last name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Enter your last name"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full h-12 px-4 text-[15px] rounded-xl border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#7C5CFC] focus:border-transparent placeholder:text-[#999999]"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-[15px] font-medium text-[#1A1A1A]">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full h-12 px-4 text-[15px] rounded-xl border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#7C5CFC] focus:border-transparent placeholder:text-[#999999]"
                autoComplete="email"
                disabled={loading}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-[15px] font-medium text-[#1A1A1A]">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full h-12 px-4 text-[15px] rounded-xl border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#7C5CFC] focus:border-transparent placeholder:text-[#999999]"
                autoComplete="new-password"
                disabled={loading}
              />
            </div>

            <div className="flex-1 flex flex-col justify-end space-y-5">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-[#7C5CFC] text-white rounded-xl font-medium text-[15px] hover:bg-[#6B4FDB] transition-colors disabled:opacity-50"
              >
                {loading ? "Creating account..." : "Create account"}
              </button>

              <p className="text-center text-[15px] text-[#666666]">
                Already have an account?{" "}
                <Link to="/login" className="text-[#7C5CFC] hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Decorative Arch Section */}
        <div className="w-[55%] relative bg-[#F5F3FF]">
          <div className="absolute inset-0 flex items-end justify-center">
            <div 
              className="w-full h-[80%] bg-[#7C5CFC] rounded-t-full"
              style={{
                background: 'linear-gradient(180deg, #7C5CFC 0%, #9F85FF 100%)',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
