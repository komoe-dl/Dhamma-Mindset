import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import pb from '../lib/pocketbase';
import { Book as BookIcon, LogOut, User } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const isValid = pb.authStore.isValid;

  const handleLogout = () => {
    pb.authStore.clear();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-zen-cream/80 backdrop-blur-md border-b border-zen-gray-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center space-x-2 group">
            <BookIcon className="w-6 h-6 text-zen-orange transition-transform group-hover:rotate-12" />
            <span className="text-xl font-serif font-bold tracking-tight text-zen-gray-dark">
              Dhamma Mindset
            </span>
          </Link>

          <div className="flex items-center space-x-6">
            <Link to="/" className="text-sm font-medium text-zen-gray hover:text-zen-orange transition-colors">
              Library
            </Link>
            {isValid && pb.authStore.model?.email === 'madgegoodence911@gmail.com' && (
              <Link to="/admin" className="text-sm font-medium text-zen-gray hover:text-zen-orange transition-colors">
                Admin
              </Link>
            )}
            {isValid ? (
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-sm font-medium text-zen-gray hover:text-zen-orange transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-1 text-sm font-medium text-zen-gray hover:text-zen-orange transition-colors"
              >
                <User className="w-4 h-4" />
                <span>Admin</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
