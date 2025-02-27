import api from './axios';
import { Customer } from '@/types';

export type { Customer };

export interface CreateCustomerDto {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

export interface UpdateCustomerDto extends Partial<CreateCustomerDto> {}

export interface GetCustomersParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface GetCustomersResponse {
  customers: Customer[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const customersApi = {
  getAll: async (params?: GetCustomersParams): Promise<GetCustomersResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);

    const { data } = await api.get<GetCustomersResponse>(`/customers${searchParams.toString() ? `?${searchParams.toString()}` : ''}`);
    return data;
  },

  getOne: async (id: string): Promise<Customer> => {
    const { data } = await api.get<Customer>(`/customers/${id}`);
    return data;
  },

  create: async (customer: CreateCustomerDto): Promise<Customer> => {
    const { data } = await api.post<Customer>('/customers', customer);
    return data;
  },

  update: async (id: string, customer: UpdateCustomerDto): Promise<Customer> => {
    const { data } = await api.patch<Customer>(`/customers/${id}`, customer);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/customers/${id}`);
  },
}; 