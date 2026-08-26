import { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, Map as MapIcon, Users, AlertTriangle, CheckCircle } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASEURL || 'http://localhost:8000/api/v1';

export default function Dashboard({ onNavigate, globalPlan }: { onNavigate: (page: string) => void, globalPlan: any }) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    axios.get(`${API_BASE}/dashboard/summary`).then(res => setData(res.data)).catch(console.error);
  }, []);

  if (!data) {
    return <div className="p-8 text-center">Loading Dashboard...</div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto font-sans pt-16">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">PUNARVAS Overview</h1>
        <button 
          onClick={() => onNavigate('MAP')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 font-medium transition"
        >
          <MapIcon size={20} /> Open GIS Map
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="text-gray-500 text-sm font-semibold mb-2 flex items-center gap-2"><Activity size={16}/> Total Habitations</div>
          <div className="text-3xl font-bold">{data.total_habitations}</div>
        </div>
        <div className="bg-red-50 p-6 rounded-xl shadow-sm border border-red-100">
          <div className="text-red-700 text-sm font-semibold mb-2 flex items-center gap-2"><AlertTriangle size={16}/> Critical Risk Habitations</div>
          <div className="text-3xl font-bold text-red-800">{data.critical_habitations}</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="text-gray-500 text-sm font-semibold mb-2 flex items-center gap-2"><Users size={16}/> Vulnerable Population</div>
          <div className="text-3xl font-bold">{data.vulnerable_population}</div>
        </div>
        <div className="bg-green-50 p-6 rounded-xl shadow-sm border border-green-100">
          <div className="text-green-700 text-sm font-semibold mb-2 flex items-center gap-2"><MapIcon size={16}/> Safe Capacity</div>
          <div className="text-3xl font-bold text-green-800">{data.available_relocation_capacity}</div>
        </div>
      </div>
      
      {globalPlan && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
            <CheckCircle className="text-green-600" /> Active Relocation Plan Generated
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-blue-700 text-sm font-semibold mb-1">Status</div>
              <div className="font-bold text-lg">{globalPlan.status}</div>
            </div>
            <div>
              <div className="text-blue-700 text-sm font-semibold mb-1">Coverage</div>
              <div className="font-bold text-lg">{globalPlan.coverage_percentage}%</div>
            </div>
            <div>
              <div className="text-blue-700 text-sm font-semibold mb-1">Allocated People</div>
              <div className="font-bold text-lg">{globalPlan.allocated_population}</div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold mb-4">Priority Habitations</h2>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b text-gray-500">
              <th className="pb-3">Name</th>
              <th className="pb-3">Population</th>
              <th className="pb-3">Risk Score</th>
              <th className="pb-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {data.priority_habitations.map((hab: any) => (
              <tr key={hab.id} className="border-b last:border-0 hover:bg-gray-50 transition">
                <td className="py-4 font-semibold">{hab.name}</td>
                <td className="py-4">{hab.population}</td>
                <td className="py-4 text-red-600 font-bold">{hab.risk_score}</td>
                <td className="py-4">
                  <button 
                    onClick={() => onNavigate('MAP')}
                    className="text-blue-600 font-medium hover:underline flex items-center gap-1"
                  >
                    View on Map
                  </button>
                </td>
              </tr>
            ))}
            {data.priority_habitations.length === 0 && (
              <tr><td colSpan={4} className="py-4 text-gray-500">No habitations found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
