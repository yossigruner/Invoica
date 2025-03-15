import { useQuery } from '@tanstack/react-query';
import { getUsers, type User, type GetUsersResponse } from '@/api/users';
import { toast } from 'sonner';

interface UseUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
}

export const useUsers = (params: UseUsersParams = {}) => {
  const {
    data,
    isLoading,
    error,
  } = useQuery<GetUsersResponse>({
    queryKey: ['users', params],
    queryFn: async () => {
      try {
        const response = await getUsers(params);
        console.log('Users API Response:', response);
        return response;
      } catch (err) {
        console.error('Users API Error:', err);
        throw err;
      }
    },
  });

  if (error) {
    toast.error('Failed to load users');
    console.error('Error fetching users:', error);
  }

  return {
    users: data?.data ?? [],
    meta: data?.meta ?? {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0
    },
    isLoading,
    error,
  };
}; 