import { useDashboardSummary } from '../../hooks/useDashboardSummary';
import { Home, AlertTriangle, Activity, Users, ShieldCheck, Loader2 } from 'lucide-react';

export const KPIGrid = () => {
  const { data, loading, error } = useDashboardSummary();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32 mb-6">
        <Loader2 className="w-8 h-8 animate-spin text-punarvas-primary-blue" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100 flex items-center">
        <AlertTriangle className="w-5 h-5 mr-2" />
        Failed to load key metrics.
      </div>
    );
  }

  const atRiskCount = data.critical_habitations + data.risk_distribution.high;

  const cards = [
    {
      title: 'AT-RISK HABITATIONS',
      value: atRiskCount,
      subValue: `${data.critical_habitations} Critical`,
      icon: Home,
      color: 'text-punarvas-primary-blue',
      bgColor: 'bg-blue-50',
      borderColor: 'border-t-punarvas-primary-blue',
      subColor: 'text-punarvas-primary-blue',
    },
    {
      title: 'CRITICAL ZONES',
      value: String(data.critical_habitations).padStart(2, '0'),
      subValue: 'Immediate attention',
      icon: AlertTriangle,
      color: 'text-punarvas-critical-red',
      bgColor: 'bg-red-50',
      borderColor: 'border-t-punarvas-critical-red',
      subColor: 'text-punarvas-critical-red',
    },
    {
      title: 'IMMEDIATE RELOCATION',
      value: data.immediate_relocation.toLocaleString(),
      subValue: 'People requiring action',
      icon: Activity,
      color: 'text-punarvas-high-orange',
      bgColor: 'bg-orange-50',
      borderColor: 'border-t-punarvas-high-orange',
      subColor: 'text-punarvas-high-orange',
    },
    {
      title: 'VULNERABLE POPULATION',
      value: (data.vulnerable_population ?? 0).toLocaleString(),
      subValue: 'People identified',
      icon: Users,
      color: 'text-punarvas-primary-blue',
      bgColor: 'bg-blue-50',
      borderColor: 'border-t-punarvas-primary-blue',
      subColor: 'text-punarvas-primary-blue',
    },
    {
      title: 'SAFE RELOCATION CAPACITY',
      value: (data.safe_relocation_capacity ?? 0).toLocaleString(),
      subValue: 'People accommodated',
      icon: ShieldCheck,
      color: 'text-punarvas-safe-green',
      bgColor: 'bg-green-50',
      borderColor: 'border-t-punarvas-safe-green',
      subColor: 'text-punarvas-safe-green',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {cards.map((card, idx) => (
        <div key={idx} className={`bg-white rounded-xl shadow-sm border border-slate-100 border-t-4 ${card.borderColor} p-4 flex flex-col`}>
          <div className="flex items-start gap-3 mb-2">
            <div className={`p-2 rounded-lg ${card.bgColor} ${card.color}`}>
              <card.icon className="w-5 h-5" />
            </div>
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wide leading-tight mt-1">{card.title}</h3>
          </div>
          <div className="mt-auto">
            <div className={`text-3xl font-bold ${card.color}`}>{card.value}</div>
            <div className={`text-[11px] font-medium mt-1 ${card.subColor}`}>{card.subValue}</div>
          </div>
        </div>
      ))}
    </div>
  );
};
