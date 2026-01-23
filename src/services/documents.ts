import { api } from './api';
import type { 
  PersonalDocument, 
  DocumentsResponse, 
  UploadDocumentUrlRequest, 
  UploadDocumentUrlResponse, 
  ConfirmDocumentUploadRequest 
} from '@/types/document';

export const documentsService = {
  getDocuments: async (): Promise<DocumentsResponse> => {
    const response = await api.get<DocumentsResponse>('/documents');
    return response.data;
  },

  getUploadUrl: async (data: UploadDocumentUrlRequest): Promise<UploadDocumentUrlResponse> => {
    const response = await api.post<UploadDocumentUrlResponse>('/documents/upload-url', data);
    return response.data;
  },

  confirmUpload: async (id: string, data: ConfirmDocumentUploadRequest): Promise<PersonalDocument> => {
    const response = await api.post<PersonalDocument>(`/documents/${id}/confirm`, data);
    return response.data;
  },

  deleteDocument: async (id: string): Promise<void> => {
    await api.delete(`/documents/${id}`);
  },

  getDownloadUrl: async (id: string): Promise<{ download_url: string }> => {
    const response = await api.get<{ download_url: string }>(`/documents/${id}/download`);
    return response.data;
  },
};
