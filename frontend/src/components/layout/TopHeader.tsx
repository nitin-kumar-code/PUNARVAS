import React from 'react';
import { Search, Bell, HelpCircle } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export const TopHeader = () => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-8">
        <h2 className="text-lg font-bold text-punarvas-text tracking-tight">Disaster Management Command Center</h2>
        
        {/* Navigation */}
        <nav className="hidden lg:flex items-center gap-6">
          <NavLink to="/live-feed" className="text-sm font-medium text-slate-500 hover:text-punarvas-text transition-colors">Live Feed</NavLink>
          <NavLink to="/alerts" className="text-sm font-medium text-slate-500 hover:text-punarvas-text transition-colors">Alerts</NavLink>
          <NavLink to="/deployment" className="text-sm font-medium text-slate-500 hover:text-punarvas-text transition-colors">Deployment</NavLink>
        </nav>
      </div>

      <div className="flex items-center gap-6">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search operational data..."
            className="w-64 bg-punarvas-bg border border-slate-200 text-sm rounded-lg pl-9 pr-4 py-1.5 focus:outline-none focus:ring-2 focus:ring-punarvas-primary-blue/20 focus:border-punarvas-primary-blue transition-all"
          />
        </div>

        {/* Status */}
        <div className="hidden md:flex items-center gap-2 bg-punarvas-bg px-3 py-1.5 rounded-full border border-slate-200">
          <div className="w-2 h-2 rounded-full bg-punarvas-safe-green" />
          <span className="text-xs font-semibold text-slate-700">System Operational</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 pl-2">
          <button className="text-slate-500 hover:text-punarvas-primary-blue transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-punarvas-critical-red rounded-full border border-white"></span>
          </button>
          <button className="text-slate-500 hover:text-punarvas-primary-blue transition-colors">
            <HelpCircle className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 overflow-hidden ml-2">
            {/* Avatar placeholder */}
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Punarvas" alt="User" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </header>
  );
};
