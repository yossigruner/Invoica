import type { Profile } from '@/types/profile';
import { api } from './api';

export async function getProfile(): Promise<Profile> {
  const response = await api.get<Profile>('/profile');
  return response.data;
}

export async function updateProfile(data: Profile): Promise<Profile> {
  const response = await api.patch<Profile>('/profile', data);
  return response.data;
} 