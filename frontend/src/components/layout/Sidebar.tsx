import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Shield, LayoutDashboard, Map as MapIcon, AlertTriangle, Users, BrainCircuit, Compass, Package, FileText, Plus, Settings, LogOut } from 'lucide-react';

export const Sidebar = () => {
  const mainNav = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Map Interface', icon: MapIcon, path: '/map' },
    { name: 'Risk & Triage', icon: AlertTriangle, path: '/risk' },
    { name: 'Relocation Planner', icon: Users, path: '/relocation' },
    { name: 'Decision Support', icon: BrainCircuit, path: '/decision' },
  ];

  const toolsNav = [
    { name: 'Hazard Explorer', icon: Compass, path: '/hazard' },
    { name: 'Resource Allocation', icon: Package, path: '/resource' },
    { name: 'Audit Logs', icon: FileText, path: '/audit' },
  ];

  return (
    <aside className="w-64 bg-punarvas-dark-navy h-screen fixed top-0 left-0 flex flex-col shadow-xl z-20">
      {/* Branding */}
      <div className="p-6 pb-8">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-white" />
          <div>
            <h1 className="text-white font-bold text-xl tracking-wide">PUNARVAS</h1>
            <p className="text-blue-200 text-[10px] leading-tight uppercase tracking-wider mt-1 opacity-80">
              Vulnerability &<br />Resettlement<br />Intelligence
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 space-y-6">
        <div>
          <h2 className="text-xs font-semibold text-blue-300/50 uppercase tracking-wider mb-3 px-3">Main</h2>
          <nav className="space-y-1">
            {mainNav.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-200 ${
                    isActive
                      ? 'bg-punarvas-primary-blue text-white font-medium shadow-md'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>

        <div>
          <h2 className="text-xs font-semibold text-blue-300/50 uppercase tracking-wider mb-3 px-3">Tools</h2>
          <nav className="space-y-1">
            {toolsNav.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-200 ${
                    isActive
                      ? 'bg-punarvas-primary-blue text-white font-medium shadow-md'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="p-4 flex flex-col gap-2 border-t border-white/10 mt-2">
        <NavLink to="/relocation" className="flex justify-center items-center gap-2 bg-punarvas-primary-blue text-white px-3 py-2.5 rounded-lg text-sm font-bold hover:bg-blue-600 transition-colors shadow-md">
          <Plus className="w-4 h-4" /> Generate Relocation Plan
        </NavLink>
        
        <NavLink to="/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-colors">
          <Settings className="w-5 h-5" /> Settings
        </NavLink>
        
        <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-colors text-left w-full">
          <LogOut className="w-5 h-5" /> Log Out
        </button>
      </div>
    </aside>
  );
};
