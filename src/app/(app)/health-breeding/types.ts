import type { HealthBreedingOverview, HealthBreedingTask } from '@/types';

export interface HealthBreedingProps {
  overview: HealthBreedingOverview;
  upcomingTasks: HealthBreedingTask[];
  onViewFilteredHerd: (filterType: 'underTreatment' | 'pregnant' | 'healthIssuesRecent' | 'vaccinationsDueOverdue') => void;
  onViewTaskDetails: (taskId: string, cowId: string) => void;
}
