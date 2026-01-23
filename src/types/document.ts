export type DocumentCategory = 'insurance' | 'identity' | 'bill' | 'prescription' | 'other';

export interface PersonalDocument {
  id: string;
  user_id: string;
  file_name: string;
  file_type: 'pdf' | 'image';
  category: DocumentCategory;
  storage_path: string;
  file_size_bytes?: number;
  description?: string;
  created_at: string;
}

export interface UploadDocumentUrlRequest {
  filename: string;
  content_type: string;
  category: DocumentCategory;
  description?: string;
}

export interface UploadDocumentUrlResponse {
  document_id: string;
  upload_url: string;
  storage_path: string;
  expires_in: number;
}

export interface ConfirmDocumentUploadRequest {
  storage_path: string;
  file_size_bytes?: number;
}

export interface DocumentsResponse {
  count: number;
  documents: PersonalDocument[];
}
