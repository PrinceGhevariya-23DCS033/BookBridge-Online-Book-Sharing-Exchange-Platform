import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BookOpen, 
  GraduationCap, 
  ShoppingBag, 
  Settings, 
  User, 
  LogOut,
  BarChart4,
  Heart,
  PieChart,
  ChevronRight
} from 'lucide-react';

const DashboardSidebar = ({ userType = "donor" }) => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  
  const getNavItems = () => {
    switch(userType) {
      case 'donor':
        return [
          { name: 'Overview', path: '/dashboard', icon: <BarChart4 /> },
          { name: 'My Donations', path: '/dashboard/donations', icon: <BookOpen /> },
          { name: 'Sponsored Books', path: '/dashboard/sponsored', icon: <Heart /> },
          { name: 'Impact', path: '/dashboard/impact', icon: <PieChart /> }
        ];
      case 'student':
        return [
          { name: 'Overview', path: '/dashboard', icon: <BarChart4 /> },
          { name: 'My Requests', path: '/dashboard/requests', icon: <GraduationCap /> },
          { name: 'Received Books', path: '/dashboard/received', icon: <BookOpen /> }
        ];
      case 'seller':
        return [
          { name: 'Overview', path: '/dashboard', icon: <BarChart4 /> },
          { name: 'Listed Books', path: '/dashboard/listings', icon: <ShoppingBag /> },
          { name: 'Sold History', path: '/dashboard/sales', icon: <PieChart /> }
        ];
      case 'admin':
        return [
          { name: 'Overview', path: '/dashboard', icon: <BarChart4 /> },
          { name: 'Manage Books', path: '/dashboard/books', icon: <BookOpen /> },
          { name: 'Manage Users', path: '/dashboard/users', icon: <User /> },
          { name: 'Requests & Donations', path: '/dashboard/matching', icon: <Heart /> },
          { name: 'Reports', path: '/dashboard/reports', icon: <PieChart /> }
        ];
      default:
        return [];
    }
  };
  
  const navItems = getNavItems();
  
  return (
    <div className={`bg-white shadow-md h-screen ${collapsed ? 'w-20' : 'w-64'} transition-all duration-300 flex flex-col`}>
      <div className="p-4 border-b flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-teal-600" />
            <span className="ml-2 text-xl font-serif font-bold text-gray-800">BookBridge</span>
          </div>
        )}
        {collapsed && <BookOpen className="h-8 w-8 text-teal-600 mx-auto" />}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-500 hover:text-teal-600 transition-colors"
        >
          <ChevronRight className={`h-5 w-5 transform ${collapsed ? '' : 'rotate-180'}`} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-2 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`
                ${location.pathname === item.path ? 'bg-teal-50 text-teal-600' : 'text-gray-700 hover:bg-gray-50 hover:text-teal-600'}
                group flex items-center px-3 py-3 rounded-md transition-colors
              `}
            >
              <div className={`${collapsed ? 'mx-auto' : 'mr-3'}`}>
                {React.cloneElement(item.icon, { className: "h-5 w-5" })}
              </div>
              {!collapsed && <span>{item.name}</span>}
            </Link>
          ))}
        </nav>
      </div>
      
      <div className="p-4 border-t">
        {!collapsed ? (
          <div>
            <Link
              to="/dashboard/settings"
              className="flex items-center px-3 py-3 text-gray-700 hover:bg-gray-50 hover:text-teal-600 rounded-md transition-colors"
            >
              <Settings className="h-5 w-5 mr-3" />
              <span>Settings</span>
            </Link>
            <Link
              to="/logout"
              className="flex items-center px-3 py-3 text-gray-700 hover:bg-gray-50 hover:text-teal-600 rounded-md transition-colors"
            >
              <LogOut className="h-5 w-5 mr-3" />
              <span>Logout</span>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <Link
              to="/dashboard/settings"
              className="text-gray-700 hover:text-teal-600 transition-colors"
              title="Settings"
            >
              <Settings className="h-5 w-5" />
            </Link>
            <Link
              to="/logout"
              className="text-gray-700 hover:text-teal-600 transition-colors"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardSidebar;