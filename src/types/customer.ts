import { Database } from '@/db/types';

export type Customer = Database['public']['Tables']['customers']['Row'];

export const defaultCustomer: Omit<Customer, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  province: '',
  zip: '',
  country: ''
};
