import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface ForgotPasswordFormProps {
  onBack: () => void;
}

export const ForgotPasswordForm = ({ onBack }: ForgotPasswordFormProps) => {
  const { resetPassword, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const success = await resetPassword(email);
    if (success) {
      setEmailSent(true);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-2xl font-bold">Reset Password</h2>
      </div>
      
      {emailSent ? (
        <div className="space-y-4">
          <div className="text-center p-4">
            <h3 className="text-xl font-semibold mb-2">Check your email</h3>
            <p className="text-muted-foreground">
              We've sent you instructions to reset your password.
            </p>
          </div>
          <Button onClick={onBack} variant="outline" className="w-full h-12">
            Back to Sign In
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-muted-foreground">
            Enter your email address and we'll send you a link to reset your password.
          </p>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="h-12"
              required
            />
          </div>
          <Button type="submit" className="w-full h-12" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>
      )}
    </div>
  );
};
