import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Calendar, LogOut, LayoutDashboard, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-gray-900">ShiftEase</span>
            </Link>
          </div>

          {isAuthenticated && (
            <div className="flex items-center space-x-4">
              <Link
                to="/profile"
                className="flex items-center space-x-2 text-gray-700 hover:text-primary transition"
              >
                <User className="h-5 w-5" />
                <span className="font-medium">{user?.name}</span>
              </Link>

              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center space-x-1 px-4 py-2 rounded-md bg-primary text-white hover:bg-blue-600 transition"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Admin</span>
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
