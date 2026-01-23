import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sharingService } from '@/services/sharing';
import { QUERY_KEYS } from '@/lib/constants';
import { toast } from 'sonner';

export const useSharedLinks = () => {
  return useQuery({
    queryKey: QUERY_KEYS.SHARED_LINKS,
    queryFn: sharingService.getSharedLinks,
  });
};

export const useCreateShareLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sharingService.createShareLink,
    onSuccess: () => {
      toast.success('Share link generated successfully');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SHARED_LINKS });
    },
    onError: (error) => {
      console.error('Share creation failed:', error);
      toast.error('Failed to create share link');
    },
  });
};

export const useRevokeShareLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sharingService.revokeShareLink,
    onSuccess: () => {
      toast.success('Link revoked successfully');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SHARED_LINKS });
    },
    onError: (error) => {
      console.error('Revocation failed:', error);
      toast.error('Failed to revoke link');
    },
  });
};
