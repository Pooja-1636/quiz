import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  History, 
  Settings, 
  LogOut, 
  GraduationCap,
  Users,
  FileQuestion,
  BarChart3
} from 'lucide-react';
import { cn } from '../lib/utils';
import { User } from '../types';

interface SidebarProps {
  user: User;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, onLogout }) => {
  const isAdmin = user.role === 'admin';

  const userLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/courses', icon: BookOpen, label: 'Courses' },
    { to: '/progress', icon: History, label: 'My Progress' },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', icon: BarChart3, label: 'Admin Stats' },
    { to: '/admin/courses', icon: GraduationCap, label: 'Manage Courses' },
    { to: '/admin/questions', icon: FileQuestion, label: 'Manage Questions' },
    { to: '/admin/users', icon: Users, label: 'User Monitoring' },
  ];

  const links = isAdmin ? adminLinks : userLinks;

  return (
    <aside className="w-64 bg-white border-r border-gray-100 h-screen sticky top-0 flex flex-col">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
          <GraduationCap size={24} />
        </div>
        <span className="font-bold text-xl tracking-tight text-gray-800">QuizPro</span>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-4">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
              isActive 
                ? "bg-primary text-white shadow-md shadow-primary/20" 
                : "text-gray-500 hover:bg-gray-50 hover:text-primary"
            )}
          >
            <link.icon size={20} className={cn("transition-transform group-hover:scale-110")} />
            <span className="font-medium">{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-50">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all group"
        >
          <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
