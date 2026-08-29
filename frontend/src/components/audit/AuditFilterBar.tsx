import React from 'react';
import { Search } from 'lucide-react';

interface Props {
  filters: any;
  setFilters: (f: any) => void;
}

export const AuditFilterBar = ({ filters, setFilters }: Props) => {
  const handleChange = (key: string, value: string) => {
    setFilters((prev: any) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      date: 'All Dates',
      eventType: 'All Events',
      habitation: 'All',
      actor: 'All',
      search: ''
    });
  };

  return (
    <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 mb-6 flex flex-wrap gap-3 items-center">
      <select 
        value={filters.date} 
        onChange={e => handleChange('date', e.target.value)}
        className="bg-white border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg px-3 py-2 outline-none focus:border-punarvas-primary-blue flex-1 min-w-[120px]"
      >
        <option>All Dates</option>
        <option>Today</option>
        <option>Last 24 Hours</option>
        <option>Last 7 Days</option>
      </select>

      <select 
        value={filters.eventType} 
        onChange={e => handleChange('eventType', e.target.value)}
        className="bg-white border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg px-3 py-2 outline-none focus:border-punarvas-primary-blue flex-1 min-w-[150px]"
      >
        <option>All Events</option>
        <option>Risk Updated</option>
        <option>Site Screened</option>
        <option>Optimization Completed</option>
        <option>Plan Generated</option>
        <option>Decision Recorded</option>
        <option>Resource Check</option>
        <option>Route Updated</option>
      </select>

      <select 
        value={filters.habitation} 
        onChange={e => handleChange('habitation', e.target.value)}
        className="bg-white border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg px-3 py-2 outline-none focus:border-punarvas-primary-blue flex-1 min-w-[120px]"
      >
        <option>All</option>
        <option>Village A</option>
        <option>Sector 4</option>
        <option>Site B</option>
        <option>Site C</option>
      </select>

      <select 
        value={filters.actor} 
        onChange={e => handleChange('actor', e.target.value)}
        className="bg-white border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg px-3 py-2 outline-none focus:border-punarvas-primary-blue flex-1 min-w-[120px]"
      >
        <option>All</option>
        <option>AI Engine</option>
        <option>System</option>
        <option>OR-Tools</option>
        <option>Officer</option>
      </select>

      <div className="relative flex-1 min-w-[180px]">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input 
          type="text" 
          placeholder="Search logs..." 
          value={filters.search}
          onChange={e => handleChange('search', e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 text-sm font-semibold rounded-lg outline-none focus:border-punarvas-primary-blue"
        />
      </div>

      <button 
        onClick={clearFilters}
        className="text-sm font-bold text-punarvas-primary-blue hover:text-blue-700 px-2"
      >
        Clear Filters
      </button>
    </div>
  );
};
