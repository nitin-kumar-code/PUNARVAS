import React from 'react';
import { Users, Bus, Home, PlusSquare, Package } from 'lucide-react';

interface Props {
  population: number;
  resources: any[];
}

export const ResourceKPICards = ({ population, resources }: Props) => {
  const getRes = (id: string) => resources.find(r => r.id === id);
  const buses = getRes('buses');
  const shelter = getRes('shelter');
  const medical = getRes('medical');
  const kits = getRes('kits');

  const Card = ({ icon: Icon, title, value, subtext, colorClass, status = 'neutral' }: any) => {
    let borderClass = 'border-slate-200 border-l-4 border-l-punarvas-primary-blue';
    let textClass = 'text-slate-500';
    let iconBgClass = 'bg-blue-50 text-punarvas-primary-blue';

    if (status === 'success') {
      borderClass = 'border-slate-200 border-l-4 border-l-punarvas-safe-green';
      textClass = 'text-punarvas-safe-green';
      iconBgClass = 'bg-green-50 text-punarvas-safe-green';
    } else if (status === 'error') {
      borderClass = 'border-red-200 border-l-4 border-l-punarvas-critical-red';
      textClass = 'text-punarvas-critical-red';
      iconBgClass = 'bg-red-50 text-punarvas-critical-red';
      title = <span className="text-punarvas-critical-red">{title}</span>;
    }

    return (
      <div className={`bg-white rounded-xl border shadow-sm p-4 flex flex-col justify-between ${borderClass} h-[110px]`}>
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBgClass}`}>
            <Icon className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-slate-700 tracking-wide uppercase">{title}</h3>
        </div>
        <div>
          <div className={`text-3xl font-black mb-0.5 ${status === 'error' ? 'text-punarvas-critical-red' : 'text-punarvas-dark-navy'}`}>
            {value.toLocaleString()}
          </div>
          <p className={`text-[11px] font-semibold ${textClass}`}>{subtext}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
      <Card 
        icon={Users} 
        title="PEOPLE TO MOVE" 
        value={population} 
        subtext="Affected population" 
      />
      
      <Card 
        icon={Bus} 
        title="BUSES REQUIRED" 
        value={buses?.required} 
        subtext={`${buses?.available} available`} 
        status={buses?.available >= buses?.required ? 'success' : 'error'}
      />
      
      <Card 
        icon={Home} 
        title="SHELTER CAPACITY" 
        value={shelter?.available} 
        subtext={`${shelter?.required} required`} 
        status={shelter?.available >= shelter?.required ? 'success' : 'error'}
      />
      
      <Card 
        icon={PlusSquare} 
        title="MEDICAL TEAMS" 
        value={medical?.required} 
        subtext={`${medical?.available} available`} 
        status={medical?.available >= medical?.required ? 'success' : 'error'}
      />
      
      <Card 
        icon={Package} 
        title="RELIEF KITS" 
        value={kits?.required} 
        subtext={`${kits?.available} available`} 
        status={kits?.available >= kits?.required ? 'success' : 'error'}
      />
    </div>
  );
};
