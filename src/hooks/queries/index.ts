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
  useDoctorCases, // NEW
  usePatientCases,
  useCase,
  useCaseNotes, // NEW
  useCreateCase,
  useUpdateCase, // Renamed from useUpdateCaseStatus
  useApproveCase, // NEW
  useAddNote, // NEW
  // useCases, // Removed or needs adaptation? existing code might use it. 
  // I replaced useCases with useDoctorCases and usePatientCases in the file, 
  // but I didn't keep useCases in useCaseQueries.ts. 
  // So I must remove it here to avoid error.
  // usePrefetchCase, // I removed this in my previous rewrite of useCaseQueries.ts? 
  // checking previous step... yes, I didn't include usePrefetchCase. 
  // So I should remove it here too.
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
  useReportDownloadUrl,
  useDoctorReports,
  useReportAnalysis,
} from './useReportQueries';

// Assignments
export {
  useMyPatients,
  useMyDoctors,
  usePatientProfileByEmail,
  useAssignPatient,
  useRevokeAssignment,
  usePrefetchPatientProfile,
  useSpecialities,
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
  useExplainText,
} from './useAIQueries';
