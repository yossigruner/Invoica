import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/api';
import { Profile } from '@/types/profile';
import { useToast } from '@/hooks/useToast';
import { logger } from '@/utils/logger';

export const useProfile = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await api.get('/profile');
      const profileData = response.data;
      
      // Validate logo data if present
      if (profileData?.companyLogo) {
        try {
          const base64Data = profileData.companyLogo.split('base64,')[1];
          atob(base64Data); // This will throw if invalid base64
        } catch (e) {
          logger.error('Invalid logo base64 data:', e);
        }
      }
      
      return profileData;
    },
  });

  const { mutate: updateProfile, isPending: isUpdating } = useMutation({
    mutationFn: async (data: Partial<Profile>) => {
      // Log the profile data being sent to backend
      logger.info('Updating profile with data:', {
        hasData: !!data,
        dataKeys: Object.keys(data),
        hasLogo: !!data?.companyLogo,
        logoType: typeof data?.companyLogo,
        logoStartsWith: data?.companyLogo?.substring(0, 50),
        logoLength: data?.companyLogo?.length,
      });
      
      const response = await api.patch('/profile', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    },
  });

  return { profile, isLoading, error, updateProfile, isUpdating };
}; 