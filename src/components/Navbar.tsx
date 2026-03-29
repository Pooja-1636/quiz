import React from 'react';
import { Bell, Search, User as UserIcon } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  user: User;
}

const Navbar: React.FC<NavbarProps> = ({ user }) => {
  return (
    <header className="h-16 bg-white border-bottom border-gray-100 px-8 flex items-center justify-between sticky top-0 z-10">
      <div className="flex-1 max-w-md">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search courses, results..." 
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary/10 transition-all outline-none text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative p-2 text-gray-400 hover:text-primary hover:bg-gray-50 rounded-lg transition-all">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="h-8 w-px bg-gray-100"></div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-gray-800 leading-none">{user.name}</p>
            <p className="text-xs text-gray-400 mt-1 capitalize">{user.role}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden border-2 border-white shadow-sm">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                <UserIcon size={20} />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
