import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Github, Twitter, Linkedin } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { logger } from "@/utils/logger";

export const RegisterForm = () => {
  const { signUp, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Component lifecycle logging
  useEffect(() => {
    logger.debug('RegisterForm Component Mounted');
    return () => logger.debug('RegisterForm Component Unmounted');
  }, []);

  // Log loading state changes
  useEffect(() => {
    logger.debug('Register Loading State Changed', { isLoading });
  }, [isLoading]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    logger.info('Register Form Submission', {
      email: formData.email,
      hasPassword: !!formData.password,
      formFields: {
        hasFirstName: !!formData.firstName,
        hasLastName: !!formData.lastName,
        hasEmail: !!formData.email,
        hasPassword: !!formData.password,
        hasConfirmPassword: !!formData.confirmPassword,
      }
    });

    if (!formData.firstName || !formData.lastName) {
      logger.warn('Registration Validation Failed', { reason: 'Missing name fields' });
      toast.error("Please enter your full name");
      return;
    }

    if (!formData.email) {
      logger.warn('Registration Validation Failed', { reason: 'Missing email' });
      toast.error("Please enter your email");
      return;
    }

    if (!formData.password) {
      logger.warn('Registration Validation Failed', { reason: 'Missing password' });
      toast.error("Please enter a password");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      logger.warn('Registration Validation Failed', { reason: 'Passwords do not match' });
      toast.error("Passwords don't match!");
      return;
    }

    try {
      logger.debug('Calling Sign Up Function', { email: formData.email });
      await signUp(formData.email, formData.password);
    } catch (error) {
      logger.error('Registration Submission Error', error);
    }
  };

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    logger.debug('Register Form Input Change', { 
      field, 
      value: field === 'password' ? '[REDACTED]' : value 
    });
    
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      logger.debug('Form Data Updated', {
        ...newData,
        password: '[REDACTED]',
        confirmPassword: '[REDACTED]'
      });
      return newData;
    });
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={handleInputChange('firstName')}
              placeholder="John"
              className="h-12"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={handleInputChange('lastName')}
              placeholder="Doe"
              className="h-12"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange('email')}
            placeholder="john@example.com"
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
            placeholder="Create a password"
            className="h-12"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleInputChange('confirmPassword')}
            placeholder="Confirm your password"
            className="h-12"
            required
          />
        </div>
        <Button type="submit" className="w-full h-12" disabled={isLoading}>
          {isLoading ? "Creating account..." : "Create Account"}
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

      <div className="flex gap-2">
        <Button variant="outline" className="w-full" onClick={() => toast.info("Github signup coming soon")}>
          <Github className="h-4 w-4" />
        </Button>
        <Button variant="outline" className="w-full" onClick={() => toast.info("Twitter signup coming soon")}>
          <Twitter className="h-4 w-4" />
        </Button>
        <Button variant="outline" className="w-full" onClick={() => toast.info("LinkedIn signup coming soon")}>
          <Linkedin className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
