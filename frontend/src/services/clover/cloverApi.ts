import { api } from '@/lib/api';

export interface CloverStatus {
  connected: boolean;
  merchantId?: string;
  connectedAt?: string;
}

export interface CloverConnectResponse {
  url: string;
}

export interface CloverDisconnectResponse {
  success: boolean;
  message: string;
}

export const cloverApi = {
  getStatus: async (): Promise<CloverStatus> => {
    const response = await api.get<CloverStatus>('/clover/status');
    return response.data;
  },

  connect: async (): Promise<CloverConnectResponse> => {
    const response = await api.get<CloverConnectResponse>('/clover/connect');
    return response.data;
  },

  disconnect: async (): Promise<CloverDisconnectResponse> => {
    const response = await api.post<CloverDisconnectResponse>('/clover/disconnect');
    return response.data;
  },
}; 