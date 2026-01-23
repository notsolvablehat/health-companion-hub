import { useMyDiabetesDashboard } from '@/hooks/queries/useDiabetesQueries';
import { DiabetesDashboardView } from '@/components/diabetes/DiabetesDashboardView';
import { EmptyDiabetesState } from '@/components/diabetes/EmptyDiabetesState';
import { Skeleton } from '@/components/ui/skeleton';

export default function DiabetesDashboard() {
  const { data: dashboard, isLoading, error } = useMyDiabetesDashboard();

  if (isLoading) {
    return <DiabetesDashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Diabetes Dashboard</h1>
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded">
          Failed to load diabetes dashboard. Please try again later.
        </div>
      </div>
    );
  }

  if (!dashboard?.has_diabetes_data) {
    return <EmptyDiabetesState message={dashboard?.message} />;
  }

  return (
    <div className="p-6">
      <DiabetesDashboardView dashboard={dashboard} />
    </div>
  );
}

function DiabetesDashboardSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
      <Skeleton className="h-48" />
      <Skeleton className="h-96" />
    </div>
  );
}
