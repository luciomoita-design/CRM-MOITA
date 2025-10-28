import { Suspense } from 'react';
import { OverviewCards } from '@/components/dashboard/overview-cards';
import { ActivityTimeline } from '@/components/dashboard/activity-timeline';
import { PipelineSnapshot } from '@/components/dashboard/pipeline-snapshot';

export default function DashboardHome() {
  return (
    <div className="grid gap-6">
      <Suspense fallback={<div>Carregando...</div>}>
        <OverviewCards />
      </Suspense>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <PipelineSnapshot />
        </div>
        <div className="lg:col-span-2">
          <ActivityTimeline />
        </div>
      </div>
    </div>
  );
}
