import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentsService } from '@/services/documents';
import { QUERY_KEYS } from '@/lib/constants';
import { toast } from 'sonner';

import type { UploadDocumentUrlRequest } from '@/types/document';

export const useDocuments = () => {
  return useQuery({
    queryKey: QUERY_KEYS.DOCUMENTS,
    queryFn: documentsService.getDocuments,
  });
};

export const useUploadDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, ...data }: UploadDocumentUrlRequest & { file: File }) => {
      // 1. Get Upload URL
      const { upload_url, storage_path, document_id } = await documentsService.getUploadUrl({
        filename: data.filename,
        content_type: data.content_type,
        category: data.category,
      });

      // 2. Upload File to Supabase Storage (bypassing main API)
      const uploadResponse = await fetch(upload_url, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file to storage');
      }

      // 3. Confirm Upload
      const document = await documentsService.confirmUpload(document_id, {
        storage_path,
        file_size_bytes: file.size,
      });

      return document;
    },
    onSuccess: () => {
      toast.success('Document uploaded successfully');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DOCUMENTS });
    },
    onError: (error) => {
      console.error('Upload failed:', error);
      toast.error('Failed to upload document');
    },
  });
};

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: documentsService.deleteDocument,
    onSuccess: () => {
      toast.success('Document deleted successfully');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DOCUMENTS });
    },
    onError: (error) => {
      console.error('Delete failed:', error);
      toast.error('Failed to delete document');
    },
  });
};
