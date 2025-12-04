import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";

export const TopNav = ({ onLogout }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();

  // Close dropdown if clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Get page title based on route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/orders') return 'Orders Management';
    if (path === '/products') return 'Products';
    if (path === '/settings') return 'Settings';
    return 'CLL Sellercenter';
  };

  return (
    <div className="w-full h-16 bg-white shadow flex justify-between items-center px-4 md:px-6">
      {/* Page Title */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">{getPageTitle()}</h1>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          {/* Profile Circle */}
          <div
            className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold cursor-pointer hover:bg-blue-200 transition-colors"
            onClick={() => setOpen(!open)}
          >
            {localStorage.getItem('lazada_account')?.charAt(0)?.toUpperCase() || 'U'}
          </div>

          {/* Dropdown */}
          {open && (
            <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg border border-gray-200 py-2 z-50">
              {/* User Info */}
              <div className="px-4 py-2 border-b border-gray-200">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {localStorage.getItem('lazada_account') || 'User'}
                </p>
                <p className="text-xs text-gray-500 uppercase">
                  {localStorage.getItem('lazada_country') || 'PH'}
                </p>
              </div>

              {/* Menu Items */}
              <button
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => {
                  setOpen(false);
                  // Add profile action here
                }}
              >
                Profile
              </button>
              <button
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => {
                  setOpen(false);
                  // Add settings action here
                }}
              >
                Account Settings
              </button>
              <div className="border-t border-gray-200 mt-1 pt-1">
                <button
                  onClick={() => {
                    setOpen(false);
                    onLogout();
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};