import { useQuery } from '@tanstack/react-query';
import { diabetesService } from '@/services/diabetes';
import { QUERY_KEYS } from '@/lib/constants';

interface UseMyDiabetesDashboardOptions {
  enabled?: boolean;
}

/**
 * Get diabetes dashboard for authenticated patient
 * 
 * @param options - Query options
 * @returns React Query result with diabetes dashboard data
 */
export function useMyDiabetesDashboard(options: UseMyDiabetesDashboardOptions = {}) {
  const { enabled = true } = options;
  
  return useQuery({
    queryKey: QUERY_KEYS.DIABETES_DASHBOARD,
    queryFn: () => diabetesService.getMyDashboard(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1, // Only retry once for 403/404 errors
    enabled,
  });
}

/**
 * Get diabetes dashboard for specific patient (doctor view)
 * 
 * @param patientId - UUID of the patient (undefined to disable query)
 * @returns React Query result with patient's diabetes dashboard data
 */
export function usePatientDiabetesDashboard(patientId: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.PATIENT_DIABETES_DASHBOARD(patientId!),
    queryFn: () => diabetesService.getPatientDashboard(patientId!),
    enabled: !!patientId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1, // Only retry once for 403/404 errors
  });
}
