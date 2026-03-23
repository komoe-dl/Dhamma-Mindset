import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import pb from '../lib/pocketbase';
import { Book as BookIcon, LogOut, User, Languages, Menu, X } from 'lucide-react';
import { useLanguage } from '../lib/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';

export default function Navbar() {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const isValid = pb.authStore.isValid;
  const user = pb.authStore.model;

  const handleLogout = () => {
    pb.authStore.clear();
    setIsMenuOpen(false);
    navigate('/');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'my' ? 'en' : 'my');
  };

  const navLinks = [
    { to: '/', label: t.nav.library },
    { to: '/guide', label: t.nav.guide },
    ...(isValid && user?.role === 'admin' ? [{ to: '/admin', label: t.nav.admin }] : []),
  ];

  return (
    <nav className="sticky top-0 z-50 bg-zen-cream/80 backdrop-blur-md border-b border-zen-gray-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group shrink-0">
            <BookIcon className="w-6 h-6 text-zen-orange transition-transform group-hover:rotate-12" />
            <span className="text-lg sm:text-xl font-serif font-bold tracking-tight text-zen-green truncate max-w-[150px] sm:max-w-none">
              {t.nav.title}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-zen-orange/10 text-zen-orange hover:bg-zen-orange hover:text-white transition-all text-xs font-bold"
            >
              <Languages className="w-3.5 h-3.5" />
              <span>{language === 'my' ? 'EN' : 'မြန်မာ'}</span>
            </button>

            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm font-medium text-zen-gray hover:text-zen-orange transition-colors"
              >
                {link.label}
              </Link>
            ))}

            {isValid ? (
              <div className="flex items-center space-x-4">
                <Link to="/profile" className="flex items-center space-x-2 group">
                  <div className="w-8 h-8 rounded-full bg-zen-orange/10 flex items-center justify-center group-hover:bg-zen-orange/20 transition-all">
                    <User className="w-4 h-4 text-zen-orange" />
                  </div>
                  <span className="text-sm font-medium text-zen-gray-dark group-hover:text-zen-orange transition-colors">
                    {user?.name || user?.username || user?.email?.split('@')[0]}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-sm font-medium text-zen-gray hover:text-zen-orange transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t.nav.logout}</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-1 text-sm font-medium text-zen-gray hover:text-zen-orange transition-colors"
              >
                <User className="w-4 h-4" />
                <span>{t.nav.login}</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex lg:hidden items-center space-x-3">
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-zen-orange/10 text-zen-orange text-[10px] font-bold"
            >
              <Languages className="w-3 h-3" />
              <span>{language === 'my' ? 'EN' : 'မြန်မာ'}</span>
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-zen-gray-dark hover:text-zen-orange transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-zen-gray-light overflow-hidden"
          >
            <div className="px-4 py-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-base font-medium text-zen-gray-dark hover:text-zen-orange transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              
              <div className="pt-4 border-t border-zen-gray-light">
                {isValid ? (
                  <div className="space-y-4">
                    <Link
                      to="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center space-x-3 text-base font-medium text-zen-gray-dark"
                    >
                      <User className="w-5 h-5 text-zen-orange" />
                      <span>{user?.name || user?.username || user?.email?.split('@')[0]}</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 text-base font-medium text-zen-gray-dark w-full text-left"
                    >
                      <LogOut className="w-5 h-5 text-zen-orange" />
                      <span>{t.nav.logout}</span>
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-3 text-base font-medium text-zen-gray-dark"
                  >
                    <User className="w-5 h-5 text-zen-orange" />
                    <span>{t.nav.login}</span>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
