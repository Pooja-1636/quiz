import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { User } from '../types';

interface LayoutProps {
  user: User;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout }) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar user={user} onLogout={onLogout} />
      <div className="flex-1 flex flex-col">
        <Navbar user={user} />
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
