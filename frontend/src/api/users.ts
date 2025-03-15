import { api } from './api';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  profile?: {
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface GetUsersResponse {
  data: User[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
}

export type UserRole = 'ADMIN' | 'USER';

export async function updateUserRole(userId: string, role: UserRole): Promise<User> {
  const response = await api.patch<User>(`/admin/users/${userId}/role`, { role });
  return response.data;
}

export async function getUsers(params: GetUsersParams = {}): Promise<GetUsersResponse> {
  const { page = 1, limit = 10, search, sortBy } = params;
  const response = await api.get<GetUsersResponse>('/admin/users', {
    params: {
      page,
      limit,
      search,
      sortBy,
    }
  });
  
  return response.data;
}

export async function deleteUser(userId: string): Promise<void> {
  await api.delete(`/admin/users/${userId}`);
} 