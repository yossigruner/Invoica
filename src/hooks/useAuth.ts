import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';
import { supabase } from '@/db/config';
import type { Profile } from '@/db/types';

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

  // Add immediate effect for testing
  useEffect(() => {
    console.log('useAuth hook mounted');
    return () => console.log('useAuth hook unmounted');
  }, []);

  // Check Supabase connection when the hook is first used
  useEffect(() => {
    const checkSupabase = async () => {
      logger.info('🔍 Checking Supabase Setup', {
        url: import.meta.env.VITE_SUPABASE_URL?.substring(0, 20) + '...',
        hasKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY
      });

      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          logger.error('❌ Supabase Session Check Failed', sessionError);
        } else {
          logger.info('✅ Supabase Session Check', {
            hasSession: !!session
          });
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
        } else {
          logger.success('✅ Supabase Connected Successfully');
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
    return () => logger.debug('Auth Hook Cleanup');
  }, []);

  // Function to save user profile data
  const saveUserProfile = async (profileData: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('No user found');

      logger.info('Saving user profile', { userId: user.id });

      // First check if profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select()
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means no rows returned
        throw fetchError;
      }

      let result;
      if (existingProfile) {
        // Update existing profile
        const { data, error } = await supabase
          .from('profiles')
          .update({
            ...profileData,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .select()
          .single();
        
        if (error) throw error;
        result = data;
      } else {
        // Insert new profile
        const { data, error } = await supabase
          .from('profiles')
          .insert([{
            user_id: user.id,
            ...profileData,
          }])
          .select()
          .single();
        
        if (error) throw error;
        result = data;
      }

      // If this is a profile completion (wizard data), mark it as completed
      if (profileData.company_name) {
        localStorage.setItem('profileCompleted', 'true');
      }

      logger.success('User profile saved', { profileId: result.id });
      return result;
    } catch (error) {
      logger.error('Failed to save user profile', error);
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

      localStorage.setItem('token', data.session?.access_token || '');
      logger.success('Sign In Successful', { userId: data.user?.id });
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

      if (!data.user?.id) {
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

  // Log initial configuration
  logger.info('Auth Configuration', {
    hasSupabaseUrl: !!import.meta.env.VITE_SUPABASE_URL,
    hasSupabaseKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
  });

  return {
    signIn,
    signUp,
    signOut,
    resetPassword,
    saveUserProfile,
    isLoading,
  };
}; 