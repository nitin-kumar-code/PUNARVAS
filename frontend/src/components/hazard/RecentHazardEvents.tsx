import React, { useMemo } from 'react';
import { CloudRain, AlertTriangle, Waves, Sun } from 'lucide-react';

export const RecentHazardEvents = () => {
  const events = useMemo(() => {
    const today = new Date();
    
    const formatDate = (daysAgo: number, timeStr: string) => {
      const d = new Date(today);
      d.setDate(d.getDate() - daysAgo);
      return `${d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}, ${timeStr}`;
    };

    return [
      {
        id: "ev-1",
        icon: "rain",
        title: "Heavy Rainfall Event",
        description: "Heavy rainfall recorded in catchment area.",
        time: formatDate(0, "10:20 AM")
      },
      {
        id: "ev-2",
        icon: "landslide",
        title: "Landslide Alert",
        description: "Landslide risk increased due to saturation.",
        time: formatDate(1, "08:15 PM")
      },
      {
        id: "ev-3",
        icon: "flood",
        title: "Flood Risk Increase",
        description: "Water levels rising in secondary basin.",
        time: formatDate(2, "06:40 PM")
      },
      {
        id: "ev-4",
        icon: "heat",
        title: "Heatwave Advisory",
        description: "Heatwave expected in northern blocks.",
        time: formatDate(3, "02:10 PM")
      }
    ];
  }, []);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'rain': return <CloudRain className="w-5 h-5 text-punarvas-primary-blue" />;
      case 'landslide': return <AlertTriangle className="w-5 h-5 text-punarvas-high-orange" />;
      case 'flood': return <Waves className="w-5 h-5 text-punarvas-primary-blue" />;
      case 'heat': return <Sun className="w-5 h-5 text-punarvas-medium-yellow" />;
      default: return <AlertTriangle className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
      <div className="p-5 border-b border-slate-100 flex justify-between items-center">
        <h3 className="text-sm font-bold text-punarvas-text flex items-center gap-2">
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Recent Hazard Events
        </h3>
        <button className="text-xs font-bold text-punarvas-primary-blue hover:text-blue-700">View All</button>
      </div>

      <div className="p-2 flex-1 overflow-y-auto space-y-1">
        {events.map((event) => (
          <div key={event.id} className="p-3 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors flex items-start gap-4">
            <div className="p-2 bg-slate-100 rounded-lg shrink-0">
              {getIcon(event.icon)}
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex justify-between items-start mb-1">
                <h4 className="text-sm font-bold text-punarvas-text truncate pr-2">{event.title}</h4>
                <span className="text-[10px] font-semibold text-slate-500 whitespace-nowrap">{event.time}</span>
              </div>
              <p className="text-xs text-slate-600 line-clamp-2">{event.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
