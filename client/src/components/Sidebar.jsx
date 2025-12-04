import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    HomeIcon,
    ShoppingBagIcon,
    ChartBarSquareIcon,
    BuildingStorefrontIcon,
    CogIcon,
} from "@heroicons/react/24/outline";

export default function Sidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const location = useLocation();

    const menuItems = [
        { name: "Dashboard", icon: ChartBarSquareIcon, path: "/dashboard" },
        { name: "Orders", icon: ShoppingBagIcon, path: "/orders" },
        { name: "Fast Fulfilment", icon: BuildingStorefrontIcon, path: "/ffr" },
        { name: "Data Insights", icon: CogIcon, path: "/data_insights" },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <div className={`flex flex-col bg-white shadow h-screen transition-all duration-300 ${isCollapsed ? "w-20" : "w-64"}`}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
                <span className={`font-bold text-lg ${isCollapsed ? "hidden" : "block"}`}>
                    CLL Sellercenter
                </span>
                <button 
                    onClick={() => setIsCollapsed(!isCollapsed)} 
                    className="p-1 rounded hover:bg-gray-100 transition-colors"
                >
                    {isCollapsed ? "→" : "←"}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-2">
                    {menuItems.map((item) => (
                        <NavItem
                            key={item.path}
                            icon={item.icon}
                            label={item.name}
                            path={item.path}
                            collapsed={isCollapsed}
                            active={isActive(item.path)}
                        />
                    ))}
                </div>
            </nav>

            {/* Footer - User Info */}
            {!isCollapsed && (
                <div className="p-4 border-t">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                            {localStorage.getItem('lazada_account')?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {localStorage.getItem('lazada_account') || 'User'}
                            </p>
                            <p className="text-xs text-gray-500 uppercase">
                                {localStorage.getItem('lazada_country') || 'PH'}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function NavItem({ icon: Icon, label, path, collapsed, active }) {
    return (
        <Link
            to={path}
            className={`flex items-center p-3 rounded-lg transition-colors ${
                collapsed ? "justify-center" : ""
            } ${
                active 
                    ? "bg-blue-50 text-blue-600 font-medium" 
                    : "text-gray-700 hover:bg-gray-100"
            }`}
        >
            <Icon className="h-5 w-5" />
            {!collapsed && <span className="ml-3">{label}</span>}
        </Link>
    );
}