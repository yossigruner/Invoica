import api from './axios';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  createdAt: string;
  updatedAt: string;
}

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

export const customersApi = {
  async create(data: CreateCustomerDto): Promise<Customer> {
    const response = await api.post('/customers', data);
    return response.data;
  },

  async getAll(): Promise<Customer[]> {
    const response = await api.get('/customers');
    return response.data;
  },

  async getOne(id: string): Promise<Customer> {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },

  async update(id: string, data: UpdateCustomerDto): Promise<Customer> {
    const response = await api.patch(`/customers/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/customers/${id}`);
  }
}; 