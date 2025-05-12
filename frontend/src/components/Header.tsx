import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
// import Sidebar from './Sidebar';

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { isAuthenticated } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      {/* <Sidebar isOpen={isSidebarOpen} onToggle={setIsSidebarOpen} /> */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <Menu className="h-6 w-6" />
            </button>
            {!isAuthenticated && (
              <h1 className="ml-2 text-xl font-semibold text-gray-900">Medi Search</h1>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default Header; 