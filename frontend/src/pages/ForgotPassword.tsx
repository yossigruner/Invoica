import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setIsSuccess(false);

    try {
      await resetPassword(email);
      setIsSuccess(true);
      setEmail(""); // Clear the form
    } catch (error) {
      let errorMessage = "Failed to send reset instructions. Please try again.";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] p-4">
      <div className="w-full max-w-[1100px] min-h-[600px] flex flex-col md:flex-row bg-white rounded-[32px] shadow-sm overflow-hidden">
        {/* Form Section */}
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
            <h1 className="text-2xl sm:text-[28px] font-semibold text-[#1A1A1A] mb-2">Reset your password</h1>
            <p className="text-sm sm:text-[15px] text-[#666666]">
              Enter your email and we'll send you instructions to reset your password.
            </p>
          </div>

          {error && (
            <div className="flex justify-center mb-6">
              <Alert 
                variant="destructive" 
                className="animate-in fade-in slide-in-from-top-1 w-full flex items-center gap-2 bg-red-50 text-red-600 border-red-200"
              >
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-center flex-grow">{error}</AlertDescription>
              </Alert>
            </div>
          )}

          {isSuccess && (
            <div className="flex justify-center mb-6">
              <Alert className="animate-in fade-in slide-in-from-top-1 w-full flex items-center gap-2 bg-green-50 text-green-600 border-green-200">
                <AlertDescription className="text-center flex-grow">
                  If an account exists for this email, you will receive password reset instructions shortly.
                </AlertDescription>
              </Alert>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                required
                className={`h-11 transition-colors duration-200 ${error ? 'border-red-500 focus:border-red-500' : ''}`}
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-[#7C5CFC] hover:bg-[#7C5CFC]/90 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send Reset Instructions"}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Remember your password?{" "}
              <Link to="/login" className="text-primary hover:text-primary/80 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Image Section */}
        <div className="hidden md:block w-[55%] bg-[#7C5CFC] relative overflow-hidden">
          <div className="absolute inset-0 from-[#7C5CFC] to-[#9F7AFF] opacity-90"></div>
          <div className="absolute inset-0 flex items-center justify-center p-12">
            <div className="text-center text-white">
              <h2 className="text-3xl font-bold mb-4">Streamline Your Invoicing</h2>
              <p className="text-lg opacity-90">
                Create, manage, and send professional invoices in minutes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
