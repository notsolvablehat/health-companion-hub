// src/components/reports/ReportFilters.tsx

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useMyPatients } from '@/hooks/queries/useAssignmentQueries';

export interface FilterState {
  patientId: string;
  fileType: 'all' | 'pdf' | 'image';
  analysisStatus: 'all' | 'analyzed' | 'pending';
}

interface ReportFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  showPatientFilter?: boolean;
}

export function ReportFilters({ filters, onFiltersChange, showPatientFilter = true }: ReportFiltersProps) {
  const { data: patientsData } = useMyPatients();

  const hasActiveFilters = filters.patientId || filters.fileType !== 'all' || filters.analysisStatus !== 'all';

  const clearFilters = () => {
    onFiltersChange({
      patientId: '',
      fileType: 'all',
      analysisStatus: 'all',
    });
  };

  return (
    <div className="flex flex-wrap gap-3 items-center">
      {/* Patient Filter */}
      {showPatientFilter && (
        <Select
          value={filters.patientId || 'all'}
          onValueChange={(value) => onFiltersChange({ ...filters, patientId: value === 'all' ? '' : value })}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Patients" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Patients</SelectItem>
            {patientsData?.patients.map(patient => (
              <SelectItem key={patient.user_id} value={patient.user_id}>
                {patient.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* File Type Filter */}
      <Select
        value={filters.fileType}
        onValueChange={(value: 'all' | 'pdf' | 'image') => onFiltersChange({ ...filters, fileType: value })}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="File Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="pdf">PDF Only</SelectItem>
          <SelectItem value="image">Images Only</SelectItem>
        </SelectContent>
      </Select>

      {/* Analysis Status Filter */}
      <Select
        value={filters.analysisStatus}
        onValueChange={(value: 'all' | 'analyzed' | 'pending') => onFiltersChange({ ...filters, analysisStatus: value })}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Analysis Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Reports</SelectItem>
          <SelectItem value="analyzed">Analyzed</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
        </SelectContent>
      </Select>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
          <X className="w-4 h-4" />
          Clear
        </Button>
      )}
    </div>
  );
}

export default ReportFilters;
