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
      
      // Add detailed logging for profile data
      logger.info('Profile data loaded from backend:', {
        hasProfileData: !!profileData,
        profileKeys: Object.keys(profileData),
        hasLogo: !!profileData?.companyLogo,
        logoType: typeof profileData?.companyLogo,
        logoStartsWith: profileData?.companyLogo?.substring(0, 50),
        logoLength: profileData?.companyLogo?.length,
        isValidDataUrl: profileData?.companyLogo?.startsWith('data:'),
        isBase64: profileData?.companyLogo?.includes('base64,'),
        base64Position: profileData?.companyLogo?.indexOf('base64,'),
        mimeType: profileData?.companyLogo?.split(';')[0]?.split(':')[1],
      });

      // Validate logo data if present
      if (profileData?.companyLogo) {
        try {
          const base64Data = profileData.companyLogo.split('base64,')[1];
          atob(base64Data); // This will throw if invalid base64
          logger.info('Logo data is valid base64');
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