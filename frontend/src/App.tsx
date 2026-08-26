import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { MapInterface } from './pages/MapInterface';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="map" element={<MapInterface />} />
          <Route path="risk" element={<div className="p-10 text-center"><h2 className="text-2xl font-bold text-slate-400">Risk & Triage (Coming Soon)</h2></div>} />
          <Route path="relocation" element={<div className="p-10 text-center"><h2 className="text-2xl font-bold text-slate-400">Relocation Planner (Coming Soon)</h2></div>} />
          <Route path="decision" element={<div className="p-10 text-center"><h2 className="text-2xl font-bold text-slate-400">Decision Support (Coming Soon)</h2></div>} />
          <Route path="*" element={<div className="p-10 text-center"><h2 className="text-2xl font-bold text-slate-400">Under Construction</h2></div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
