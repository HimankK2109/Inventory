import { Link, useLocation } from "react-router-dom";
import { Home, Package, ShoppingCart, BarChart, Coffee } from "lucide-react";

const Layout = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", path: "/", icon: Home },
    { name: "Add Order", path: "/addOrder", icon: Coffee },
    { name: "Inventory", path: "/inventory", icon: Package },
    { name: "Orders", path: "/orders", icon: ShoppingCart },
    { name: "Insights", path: "/insights", icon: BarChart },
  ];

  return (
    <div className="flex h-screen">
      
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex flex-col">
        
        {/* Logo */}
        <div className="p-4 text-xl font-bold border-b border-gray-700">
          GreenTrack
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 p-2 rounded-lg transition ${
                  isActive
                    ? "bg-gray-700"
                    : "hover:bg-gray-800"
                }`}
              >
                <Icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-100 p-6 overflow-auto">
        {children}
      </div>
    </div>
  );
};

export default Layout;