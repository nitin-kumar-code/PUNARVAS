import { AlertTriangle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDashboardSummary } from '../../hooks/useDashboardSummary';

export const CriticalAlerts = () => {
  const { data, loading, error } = useDashboardSummary();
  const navigate = useNavigate();

  const alerts = data?.critical_alerts?.slice(0, 3) ?? [];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-punarvas-critical-red" />
          <h3 className="font-bold text-punarvas-text text-lg">Critical Alerts</h3>
        </div>
        <button
          onClick={() => navigate('/risk')}
          className="text-sm font-semibold text-punarvas-primary-blue hover:underline"
        >
          View All
        </button>
      </div>

      <div className="flex-1 p-4 space-y-3 overflow-y-auto relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
            <Loader2 className="w-6 h-6 animate-spin text-punarvas-primary-blue" />
          </div>
        )}
        
        {error && alerts.length === 0 && (
          <div className="text-center text-sm text-red-500 py-8">
            Failed to load alerts
          </div>
        )}

        {!loading && alerts.length === 0 && !error && (
          <div className="text-center text-sm text-slate-500 py-8">
            No critical alerts at this time
          </div>
        )}

        {alerts.map((alert) => (
          <div 
            key={alert.id} 
            className={`border rounded-lg p-4 ${
              alert.riskLevel === 'Critical' ? 'bg-red-50/50 border-red-100' : 
              alert.riskLevel === 'High' ? 'bg-orange-50/50 border-orange-100' : 
              'bg-yellow-50/50 border-yellow-100'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`mt-1 w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                alert.riskLevel === 'Critical' ? 'bg-punarvas-critical-red' : 
                alert.riskLevel === 'High' ? 'bg-punarvas-high-orange' : 
                'bg-punarvas-medium-yellow'
              }`} />
              
              <div className="flex-1">
                <h4 className="font-bold text-punarvas-text text-sm mb-1 leading-tight">{alert.title}</h4>
                <div className="text-xs text-slate-500 mb-3">
                  {alert.timeAgo} &bull; {alert.vulnerablePeople} vulnerable people
                </div>
                
                <div className="flex gap-2">
                  {alert.riskLevel === 'Critical' ? (
                    <>
                      <button
                        onClick={() => navigate('/risk')}
                        className="px-3 py-1.5 border border-red-200 text-punarvas-critical-red bg-white rounded text-xs font-semibold hover:bg-red-50 transition-colors"
                      >
                        View Risk
                      </button>
                      <button
                        onClick={() => navigate('/relocation')}
                        className="px-3 py-1.5 bg-punarvas-critical-red text-white rounded text-xs font-semibold hover:bg-red-700 transition-colors"
                      >
                        Start Relocation
                      </button>
                    </>
                  ) : alert.riskLevel === 'High' && alert.type === 'habitation' ? (
                    <button
                      onClick={() => navigate('/risk')}
                      className="px-3 py-1.5 border border-orange-200 text-punarvas-high-orange bg-white rounded text-xs font-semibold hover:bg-orange-50 transition-colors"
                    >
                      Assess
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate('/map')}
                      className="px-3 py-1.5 border border-yellow-300 text-punarvas-medium-yellow bg-white rounded text-xs font-semibold hover:bg-yellow-50 transition-colors"
                    >
                      Reassess Site
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
