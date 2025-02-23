import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/types';
import { logger } from '@/utils/logger';

export const useProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch profile on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  // Fetch the current user's profile
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('No user found');

      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;

      setProfile(data);
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('Failed to fetch profile', error);
    } finally {
      setLoading(false);
    }
  };

  // Update profile
  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('No user found');

      const { data, error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      setProfile(data);
      logger.success('Profile updated successfully', { profileId: data?.id });
      return data;
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('Failed to update profile', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Create initial profile
  const createProfile = async (profileData: Partial<Profile>) => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('No user found');

      const { data, error: createError } = await supabase
        .from('profiles')
        .insert([{ user_id: user.id, ...profileData }])
        .select()
        .single();

      if (createError) throw createError;

      setProfile(data);
      logger.success('Profile created successfully', { profileId: data?.id });
      return data;
    } catch (err) {
      const error = err as Error;
      setError(error);
      logger.error('Failed to create profile', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Check if profile is complete
  const isProfileComplete = () => {
    if (!profile) return false;
    return profile.is_profile_completed;
  };

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
    createProfile,
    isProfileComplete,
  };
}; 