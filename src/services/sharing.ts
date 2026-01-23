import { api } from './api';
import type { 
  CreateShareLinkRequest, 
  CreateShareLinkResponse, 
  ManageLinksResponse 
} from '@/types/sharing';

export const sharingService = {
  createShareLink: async (data: CreateShareLinkRequest): Promise<CreateShareLinkResponse> => {
    const response = await api.post<CreateShareLinkResponse>('/share/create', data);
    return response.data;
  },

  getSharedLinks: async (): Promise<ManageLinksResponse> => {
    const response = await api.get<ManageLinksResponse>('/share/manage');
    return response.data;
  },

  revokeShareLink: async (id: string): Promise<void> => {
    await api.delete(`/share/${id}`);
  },
};
