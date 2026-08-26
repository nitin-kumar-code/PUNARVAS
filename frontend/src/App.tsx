import { useState } from 'react';
import GisMap from './components/GisMap';
import Dashboard from './components/Dashboard';
import { ArrowLeft } from 'lucide-react';
import './index.css';

function App() {
  const [page, setPage] = useState('DASHBOARD');
  // Lift plan state to share between map and dashboard for demo purposes
  const [globalPlan, setGlobalPlan] = useState<any>(null);

  return (
    <div className="w-full h-screen m-0 p-0 overflow-hidden bg-gray-50 flex flex-col font-sans">
      {page === 'MAP' && (
        <div className="absolute top-4 left-4 z-[2000]">
          <button 
            onClick={() => setPage('DASHBOARD')}
            className="bg-white hover:bg-gray-100 text-gray-800 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 font-medium border border-gray-200 transition"
          >
            <ArrowLeft size={20} /> Back to Dashboard
          </button>
        </div>
      )}

      <div className="flex-grow relative overflow-y-auto">
        {page === 'DASHBOARD' && <Dashboard onNavigate={setPage} globalPlan={globalPlan} />}
        {page === 'MAP' && <GisMap globalPlan={globalPlan} setGlobalPlan={setGlobalPlan} />}
      </div>
    </div>
  );
}

export default App;
