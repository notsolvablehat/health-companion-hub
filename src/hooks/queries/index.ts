// src/hooks/queries/index.ts

// Auth
export {
  useCurrentUser,
  useUserProfile,
  useLogin,
  useRegister,
  useOnboardPatient,
  useOnboardDoctor,
  useUpdateProfile,
  useLogout,
} from './useAuthQueries';

// Cases
export {
  useCases,
  useCase,
  usePatientCases,
  useCreateCase,
  useUpdateCaseStatus,
  usePrefetchCase,
} from './useCaseQueries';

// Reports
export {
  useReports,
  useCaseReports,
  usePatientReports,
  useReport,
  useUploadReport,
  useDownloadReport,
  usePrefetchReport,
} from './useReportQueries';

// Assignments
export {
  useMyPatients,
  useMyDoctors,
  usePatientProfile,
  useAssignPatient,
  useRevokeAssignment,
  usePrefetchPatientProfile,
} from './useAssignmentQueries';

// AI
export {
  useChats,
  useChat,
  useStartChat,
  useSendMessage,
  useDeleteChat,
  useUpdateChatReports,
  useExtractReport,
  useAnalyzeReport,
  useSummarizeCase,
  usePatientInsights,
  usePrefetchChat,
} from './useAIQueries';
