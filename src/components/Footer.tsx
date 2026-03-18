import React from 'react';
import { Book } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-zen-gray-dark text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Book className="w-6 h-6 text-zen-orange" />
              <span className="text-2xl font-serif font-bold tracking-tight">
                Dhamma Mindset
              </span>
            </div>
            <p className="text-white/60 leading-relaxed">
              A sanctuary for spiritual growth and mindfulness. Our mission is to provide accessible wisdom for everyone seeking inner peace.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-serif font-bold mb-6">Quick Links</h4>
            <ul className="space-y-4 text-white/60">
              <li><a href="#" className="hover:text-zen-orange transition-colors">About Academy</a></li>
              <li><a href="#" className="hover:text-zen-orange transition-colors">Library</a></li>
              <li><a href="#" className="hover:text-zen-orange transition-colors">Meditation Guides</a></li>
              <li><a href="#" className="hover:text-zen-orange transition-colors">Contact Us</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-serif font-bold mb-6">Newsletter</h4>
            <p className="text-white/60 mb-6">Receive weekly mindfulness tips and library updates.</p>
            <form className="flex space-x-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-4 py-3 rounded-full bg-white/10 border border-white/10 focus:outline-none focus:border-zen-orange transition-colors"
              />
              <button className="px-6 py-3 bg-zen-orange rounded-full font-bold hover:bg-zen-orange-light transition-colors">
                Join
              </button>
            </form>
          </div>
        </div>
        
        <div className="mt-20 pt-8 border-t border-white/10 text-center text-white/40 text-sm">
          <p>© {new Date().getFullYear()} Dhamma Mindset Academy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
