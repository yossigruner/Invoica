import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
      <div className="w-full max-w-[1100px] min-h-[600px] flex bg-white rounded-[32px] shadow-sm overflow-hidden">
        {/* Form Section */}
        <div className="w-[45%] p-12 flex flex-col">
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
            <h1 className="text-[28px] font-semibold text-[#1A1A1A] mb-2">Reset Password</h1>
            <p className="text-[15px] text-[#666666]">Enter your email address and we'll send you instructions to reset your password.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-5">
            {error && (
              <div className="px-4 py-3 bg-[#FEF2F2] text-[#EF4444] text-[14px] rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="px-4 py-3 bg-[#F0FDF4] text-[#22C55E] text-[14px] rounded-lg">
                Check your email for password reset instructions.
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-[15px] font-medium text-[#1A1A1A]">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-12 px-4 text-[15px] rounded-xl border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#7C5CFC] focus:border-transparent placeholder:text-[#999999]"
                autoComplete="email"
                disabled={loading || success}
              />
            </div>

            <div className="flex-1 flex flex-col justify-end space-y-5">
              <button
                type="submit"
                disabled={loading || success}
                className="w-full h-12 bg-[#7C5CFC] text-white rounded-xl font-medium text-[15px] hover:bg-[#6B4FDB] transition-colors disabled:opacity-50"
              >
                {loading ? "Sending..." : "Reset Password"}
              </button>

              <p className="text-center text-[15px] text-[#666666]">
                Remember your password?{" "}
                <Link to="/login" className="text-[#7C5CFC] hover:underline font-medium">
                  Back to Login
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Decorative Arch Section */}
        <div className="w-[55%] relative bg-[#F5F3FF] flex items-center justify-center">
          <div 
            className="w-[40%] aspect-[2/2.2] rounded-t-full"
            style={{
              background: 'linear-gradient(180deg, #7C5CFC 0%, #9F85FF 70%, rgba(255, 255, 255, 0) 100%)'
            }}
          />
        </div>
      </div>
    </div>
  );
}
