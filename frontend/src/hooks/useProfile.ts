import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfile, updateProfile as updateProfileApi } from '@/api/profile';
import type { Profile } from '@/types/profile';
import { useToast } from '@/hooks/useToast';

export function useProfile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
  });

  const { mutate: updateProfile, isPending: isUpdating } = useMutation({
    mutationFn: (data: Profile) => updateProfileApi(data),
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

  return {
    profile,
    isLoading,
    error,
    updateProfile,
    isUpdating,
  };
} 