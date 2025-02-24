import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { AxiosError } from "axios";

export default function Login() {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    console.log('🔐 Login attempt:', { email: formData.email });
    
    try {
      setLoading(true);
      console.log('⏳ Starting login process...');
      await login(formData);
      console.log('✅ Login successful');
    } catch (error) {
      console.error("❌ Login error:", {
        error,
        status: error instanceof AxiosError ? error.response?.status : undefined,
        data: error instanceof AxiosError ? error.response?.data : undefined,
        message: error instanceof Error ? error.message : 'Unknown error',
      });

      if (error instanceof AxiosError && error.response?.data) {
        // Display the specific error message from the server
        const errorMessage = error.response.data.message || "Invalid credentials";
        console.log('❌ Server error message:', errorMessage);
        setError(errorMessage);
      } else {
        console.log('❌ Unexpected error:', error);
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
      console.log('🔄 Login process completed');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('📝 Form field changed:', e.target.name);
    setError(null);
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="container flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-[400px] shadow-lg">
        <CardHeader className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">I</span>
            </div>
            <span className="font-bold text-xl text-foreground">Inspecta</span>
          </div>
          <div>
            <CardTitle className="text-foreground">Sign In</CardTitle>
          </div>
          <CardDescription className="text-muted-foreground">
            Enter your email and password to sign in to your account.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
                className="border-input bg-background text-foreground"
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-foreground">Password</Label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                className="border-input bg-background text-foreground"
                autoComplete="current-password"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
            <div className="text-sm text-center text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary hover:text-primary/80 transition-colors">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
