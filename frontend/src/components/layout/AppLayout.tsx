import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';
import { Outlet } from 'react-router-dom';

export const AppLayout = () => {
  return (
    <div className="flex min-h-screen bg-punarvas-bg">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <TopHeader />
        <main className="flex-1 p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
