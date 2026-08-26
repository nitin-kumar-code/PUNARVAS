import { useState, useEffect } from 'react';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { KPIGrid } from '../components/dashboard/KPIGrid';
import { RiskMapCard } from '../components/dashboard/RiskMapCard';
import { CriticalAlerts } from '../components/dashboard/CriticalAlerts';
import { RiskDistribution } from '../components/dashboard/RiskDistribution';
import { PriorityHabitations } from '../components/dashboard/PriorityHabitations';
import { QuickActions } from '../components/dashboard/QuickActions';

export const Dashboard = () => {
  return (
    <div className="max-w-[1600px] mx-auto w-full pb-10">
      <DashboardHeader />
      <KPIGrid />
      
      {/* Middle Section: Map + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <RiskMapCard />
        </div>
        <div className="lg:col-span-1">
          <CriticalAlerts />
        </div>
      </div>
      
      {/* Bottom Section: Stats + Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <RiskDistribution />
        </div>
        <div className="lg:col-span-2">
          <PriorityHabitations />
        </div>
      </div>

      <QuickActions />
    </div>
  );
};
