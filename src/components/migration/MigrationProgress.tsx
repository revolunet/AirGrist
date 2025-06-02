import { Progress } from "@/components/ui/progress";

interface MigrationProgressProps {
  currentStep: number;
  totalSteps: number;
}

export const MigrationProgress = ({ currentStep, totalSteps }: MigrationProgressProps) => {
  const getProgress = () => {
    return Math.min((currentStep / totalSteps) * 100, 100);
  };

  return (
    <div className="max-w-4xl mx-auto mb-8">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-700">Progress</span>
        <span className="text-sm text-gray-500">{currentStep}/{totalSteps} steps</span>
      </div>
      <Progress value={getProgress()} className="h-2" />
    </div>
  );
}; 