import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-slate-700/50',
        className
      )}
      {...props}
    />
  );
}

// Preset per casi comuni
function SkeletonCard() {
  return (
    <div className="bg-slate-800/60 rounded-xl p-6 border border-slate-700/50 space-y-4">
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}

function SkeletonWorkoutDay() {
  return (
    <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    </div>
  );
}

function SkeletonStats() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
          <Skeleton className="h-4 w-1/2 mb-2" />
          <Skeleton className="h-8 w-2/3" />
        </div>
      ))}
    </div>
  );
}

function SkeletonDashboard() {
  return (
    <div className="space-y-6 p-4 md:p-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <Skeleton className="h-10 w-10 rounded-lg" />
        </div>
      </div>

      {/* Stats */}
      <SkeletonStats />

      {/* Main card */}
      <SkeletonCard />

      {/* Workout days */}
      <div className="grid md:grid-cols-2 gap-4">
        <SkeletonWorkoutDay />
        <SkeletonWorkoutDay />
      </div>
    </div>
  );
}

export { Skeleton, SkeletonCard, SkeletonWorkoutDay, SkeletonStats, SkeletonDashboard };
