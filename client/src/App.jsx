import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useState } from "react";
import LazadaAuth from "./pages/LazadaAuth.jsx";
import Callback from "./pages/Callback.jsx";
import Dashboard from "./pages/Dashboard.jsx";

// To this (mixing default and named imports):
import OrderItems from "./pages/OrderItems.jsx";  // default import
import Sidebar from "./components/Sidebar.jsx";    // default import
import { TopNav } from "./components/TopNav.jsx";  // named import (note the curly braces)
import Ffr from "./pages/Ffr.jsx";
import DataInsights from "./pages/DataInsights.jsx";

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Main Layout Wrapper
function Layout({ children }) {
  const location = useLocation();
  const isAuthPage = location.pathname === '/' || location.pathname === '/callback';
  const isAuthenticated = localStorage.getItem('lazada_access_token');

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/cll/';
  };

  // Don't show sidebar/topnav on auth pages
  if (isAuthPage || !isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Navigation */}
        <TopNav onLogout={handleLogout} />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

// Protected Route Component
function ProtectedRoute({ children }) {
  const isAuthenticated = localStorage.getItem('lazada_access_token');

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter basename="/cll">
      <Layout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LazadaAuth apiUrl={API_URL} />} />
          <Route path="/callback" element={<Callback apiUrl={API_URL} />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard apiUrl={API_URL} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrderItems apiUrl={API_URL} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ffr"
            element={
              <ProtectedRoute>
                <Ffr apiUrl={API_URL} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/data_insights"
            element={
              <ProtectedRoute>
                <DataInsights apiUrl={API_URL} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-2xl font-bold mb-4">Settings</h2>
                  <p className="text-gray-600">Settings page coming soon...</p>
                </div>
              </ProtectedRoute>
            }
          />

          {/* 404 Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;