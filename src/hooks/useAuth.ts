import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types';
import { User } from '@supabase/supabase-js';

// Add immediate console logs to debug
console.log('=== Starting useAuth.ts ===');
console.log('Logger available:', !!logger);

// Test logger directly
try {
  logger.info('Direct Logger Test');
  console.log('Logger test completed');
} catch (e) {
  console.error('Logger test failed:', e);
}

// Test Supabase connection immediately
(async () => {
  console.log('Testing Supabase connection...');
  try {
    const { data, error } = await supabase.auth.getSession();
    console.log('Supabase connection test result:', { hasSession: !!data.session, error });
  } catch (e) {
    console.error('Supabase connection test failed:', e);
  }
})();

export const useAuth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Add immediate effect for testing
  useEffect(() => {
    return () => {  };
  }, []);

  // Check Supabase connection when the hook is first used
  useEffect(() => {
    const checkSupabase = async () => {

      try {
        const { error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          logger.error('❌ Supabase Session Check Failed', sessionError);
        }

        // Try a simple query
        const { error: queryError } = await supabase
          .from('profiles')
          .select('*')
          .limit(1);

        if (queryError) {
          logger.error('❌ Supabase Query Failed', {
            error: queryError.message,
            code: queryError.code
          });
        } 
      } catch (error) {
        logger.error('❌ Supabase Connection Failed', error);
      }
    };

    checkSupabase();
  }, []);

  // Log when hook is initialized
  useEffect(() => {
    logger.debug('Auth Hook Initialized');
    return () => { logger.debug('Auth Hook Cleanup'); };
  }, []);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Function to save user profile data
  const saveUserProfile = async (profileData: Partial<Profile>) => {
    if (!user) throw new Error('No user logged in');

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        ...profileData,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      logger.error('Failed to save profile', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    logger.auth('Sign In Process Started', { email });
    try {
      setIsLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      localStorage.setItem('token', data.session.access_token || '');
      logger.success('Sign In Successful', { userId: data.user.id });
      toast.success('Successfully signed in!');
      navigate('/');
    } catch (error: any) {
      logger.error('Sign In Failed', error);
      toast.error(error.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    profileData: Pick<Profile, 'first_name' | 'last_name' | 'email'>
  ) => {
    logger.info('Starting Sign Up Process', { email });
    try {
      setIsLoading(true);

      // Sign up the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: {
            first_name: profileData.first_name,
            last_name: profileData.last_name,
            email: profileData.email
          }
        }
      });

      if (error) throw error;

      if (!data.user.id) {
        throw new Error('Failed to create user account');
      }

      // Create the initial profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            user_id: data.user.id,
            first_name: profileData.first_name,
            last_name: profileData.last_name,
            email: profileData.email,
            is_profile_completed: false
          }
        ]);

      if (profileError) {
        logger.error('Profile Creation Failed', profileError);
        throw new Error('Failed to create user profile');
      }

      toast.success('Registration successful! Please check your email for verification.');
      navigate('/login');
    } catch (error: any) {
      logger.error('Sign Up Process Failed', error);
      toast.error(error.message || 'Failed to register');
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      logger.auth('Sign Out Attempt');

      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('profileCompleted');
      localStorage.removeItem('signature');
      localStorage.removeItem('companyLogo');
      localStorage.removeItem('profileData');

      logger.success('Sign Out Successful');
      toast.success('Successfully signed out!');
      navigate('/login');
    } catch (error: any) {
      logger.error('Sign Out Failed', error);
      toast.error(error.message || 'Failed to sign out');
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    logger.auth('Reset Password Process Started', { email });
    try {
      setIsLoading(true);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      logger.success('Reset Password Email Sent', { email });
      toast.success('Password reset email sent!');
      return true;
    } catch (error: any) {
      logger.error('Reset Password Failed', error);
      toast.error(error.message || 'Failed to send reset email');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    signIn,
    signUp,
    signOut,
    resetPassword,
    saveUserProfile,
    isLoading,
  };
}; 