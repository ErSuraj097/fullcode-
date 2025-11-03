import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  FolderIcon,
  CogIcon,
  PlusIcon,
  SparklesIcon,
  PowerIcon,
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  HomeModernIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../providers/AuthProvider';
import { useTheme } from '../../providers/ThemeProvider';
import { LayoutDashboard, CreditCard } from 'lucide-react';
import Logo from '../../../public/logo2.png'
interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  badge?: string;
  description?: string;
}




const navigation: NavigationItem[] = [


  {
    name: 'Home',
    href: '/app/public',
    icon: HomeModernIcon,
    description: 'Test your chatbots'
  },
  {
    name: 'Dashboard',
    href: '/app/dashboard',
    icon: LayoutDashboard,
    description: 'Overview and analytics'
  },
  {
    name: 'Projects',
    href: '/app/projects',
    icon: FolderIcon,
    description: 'Manage your chatbot projects'
  },
  {
    name: 'New Project',
    href: '/app/projects/new',
    icon: PlusIcon,
    description: 'Create a new chatbot'
  },
 

  {
    name: 'Prediction',
    href: '/app/prediction',
    icon: SparklesIcon,
    description: 'AI predictions and insights'
  },

  {
    name: 'Subscription',
    href: '/app/subscription',
    icon: CreditCard,
    description: 'Manage your subscription and billing'
  },

  // {
  //   name: 'Analytics',
  //   href: '/app/analytics',
  //   icon: SparklesIcon,
  //   description: 'Performance analytics and insights'
  // },





  {
    name: 'Account Settings',
    href: '/app/account/settings',
    icon: UserCircleIcon,
    description: 'Manage your account and preferences'
  },

  {
    name: 'How to Use',
    href: '/how-to-use',
    icon: CogIcon,
    description: 'Account and preferences'
  },
];

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed = false,
  onToggleCollapse,
  className = ""
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActiveRoute = (href: string) => {
    if (href === '/app/projects' && location.pathname.startsWith('/app/projects')) {
      return true;
    }
    return location.pathname === href;
  };

  return (
    <div className={`h-full flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 shadow-sm ${className}`}>
      {/* Logo and Toggle */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 flex items-center justify-center shadow-sm">
         <img src={Logo} alt=""  />
          </div>
          {!isCollapsed && (
            <div>
              <span className="text-lg font-bold text-[#e1802be0] dark:text-white">
               
Sambhāṣinīसंभाषिणी

              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Jethat Ai Chatbot Platform
              </p>
            </div>
          )}
        </div>

        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <Bars3Icon className="w-5 h-5" />
            ) : (
              <XMarkIcon className="w-5 h-5" />
            )}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = isActiveRoute(item.href);

          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={`
                group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 relative
                ${isActive
                  ? 'bg-blue-50 text-[#e1802be0] dark:bg-blue-900/20 dark:text-[#e1802be0] shadow-sm'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                }
              `}
              title={isCollapsed ? item.name : item.description}
            >
              <item.icon
                className={`
                  ${isCollapsed ? 'mx-auto' : 'mr-3'} h-5 w-5 transition-colors duration-200 flex-shrink-0
                  ${isActive
                    ? 'text-[#e1802be0] dark:text-[#e1802be0]/50'
                    : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                  }
                `}
              />
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <span className="block truncate">{item.name}</span>
                  {item.description && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 block truncate">
                      {item.description}
                    </span>
                  )}
                </div>
              )}
              {item.badge && !isCollapsed && (
                <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-[#e1802be0] text-[#e1802be0] dark:bg-[#e1802be0] dark:text-[#e1802be0] rounded-full">
                  {item.badge}
                </span>
              )}
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#e1802be0] dark:bg-[#e1802be0] rounded-r-full" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Theme Toggle */}
      <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={toggleTheme}
          className={`
            w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200
            text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white
          `}
          title={isCollapsed ? "Toggle theme" : `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? (
            <svg className={`${isCollapsed ? 'mx-auto' : 'mr-3'} h-5 w-5`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className={`${isCollapsed ? 'mx-auto' : 'mr-3'} h-5 w-5`} fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          )}
          {!isCollapsed && (
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          )}
        </button>
      </div>

      {/* User Section */}
      {user && (
        <div className="px-3 py-3 border-t border-gray-200 dark:border-gray-700">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={`
                w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200
                text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white
                ${showUserMenu ? 'bg-gray-50 dark:bg-gray-800' : ''}
              `}
            >
              <div className={`${isCollapsed ? 'mx-auto' : 'mr-3'} w-8 h-8 bg-[#e1802be0] rounded-full flex items-center justify-center text-white font-medium text-sm flex-shrink-0`}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user.email}
                  </p>
                </div>
              )}
            </button>

            {/* User Menu Dropdown */}
            {showUserMenu && !isCollapsed && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
                <button
                  type="button"
                  onClick={() => {
                    navigate('/app/settings');
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <UserCircleIcon className="mr-3 h-4 w-4" />
                  Profile Settings
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleLogout();
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <PowerIcon className="mr-3 h-4 w-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;