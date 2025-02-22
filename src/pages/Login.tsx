import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Twitter } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { logger } from "@/utils/logger";

const Login = () => {
  const navigate = useNavigate();
  const { signIn, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    logger.info('Starting login process', { email: formData.email });

    try {
      await signIn(formData.email, formData.password);
    } catch (error) {
      logger.error('Login failed in component', error);
    }
  };

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-50 p-4">
      <Card className="w-full max-w-md p-8 shadow-xl">
        <div className="flex flex-col items-center gap-6 mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold">I</span>
            </div>
            <span className="text-xl font-semibold bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
              InspectaInvoice
            </span>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
            <p className="text-gray-500 mt-2">Please enter your details to continue</p>
          </div>
        </div>

        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                placeholder="Enter your email"
                className="h-12"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange('password')}
                placeholder="Enter your password"
                className="h-12"
                required
              />
            </div>
            <div className="flex items-center justify-between">
              <Link to="/forgot-password" className="text-primary hover:underline text-sm">
                Forgot password?
              </Link>
            </div>
            <Button type="submit" className="w-full h-12" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => toast.info("Apple login coming soon")}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.52-3.2 0-1.39.68-2.12.53-3.02-.36C3.33 15.85 4.18 9.92 8.92 9.6c1.16.04 2.04.41 2.82.43.77.01 1.57-.31 2.91-.37 1.85-.08 3.24.77 4.08 1.97-3.39 2.21-2.85 6.76.32 8.65ZM15.31 9.42c-.19-2.57 2.09-4.76 4.69-4.92.11 2.84-2.49 4.91-4.69 4.92Z"/>
              </svg>
            </Button>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => toast.info("Google login coming soon")}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            </Button>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => toast.info("Twitter login coming soon")}
            >
              <Twitter className="h-5 w-5 text-primary" />
            </Button>
          </div>

          <div className="text-center text-sm">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Login;
