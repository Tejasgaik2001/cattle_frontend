import type { HealthBreedingProps } from '../types';
import { HealthBreedingOverviewCard } from './HealthBreedingOverviewCard';
import { UpcomingTasksList } from './UpcomingTasksList';

export function HealthBreeding({ overview, upcomingTasks, onViewFilteredHerd, onViewTaskDetails }: HealthBreedingProps) {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <HealthBreedingOverviewCard overview={overview} onViewFilteredHerd={onViewFilteredHerd} />
      <UpcomingTasksList tasks={upcomingTasks} onViewTaskDetails={onViewTaskDetails} />
    </div>
  );
}
