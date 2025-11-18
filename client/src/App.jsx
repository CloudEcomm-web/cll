import { HashRouter, Routes, Route, Link, BrowserRouter } from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import LazadaAuth from "./pages/LazadaAuth.jsx";
import OrderItems from "./pages/OrderItems.jsx";

const API_URL = import.meta.env.VITE_API_URL || '/api';

function App() {
  return (
    <BrowserRouter basename="/cll/" >
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <span className="text-xl font-bold text-blue-600">CLL</span>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <Link to="/" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                    Home
                  </Link>
                  <Link to="/dashboard" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                    Dashboard
                  </Link>
                  <Link to="/orders" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                    Orders
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<LazadaAuth apiUrl={API_URL} />} />
          <Route path="/callback" element={<LazadaAuth apiUrl={API_URL} />} />
          <Route path="/dashboard" element={<Dashboard apiUrl={API_URL} />} />
          <Route path="/orders" element={<OrderItems apiUrl={API_URL} />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;