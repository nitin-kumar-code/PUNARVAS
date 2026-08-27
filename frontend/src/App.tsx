import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { MapInterface } from './pages/MapInterface';
import { RiskTriage } from './pages/RiskTriage';
import { RelocationPlanner } from './pages/RelocationPlanner';
import { DecisionSupport } from './pages/DecisionSupport';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="map" element={<MapInterface />} />
          <Route path="risk" element={<RiskTriage />} />
          <Route path="relocation" element={<RelocationPlanner />} />
          <Route path="decision" element={<DecisionSupport />} />
          <Route path="*" element={<div className="p-10 text-center"><h2 className="text-2xl font-bold text-slate-400">Under Construction</h2></div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
