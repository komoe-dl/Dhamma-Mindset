import React from 'react';
import { Book } from 'lucide-react';
import { useLanguage } from '../lib/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-zen-gray-dark text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Book className="w-6 h-6 text-zen-orange" />
              <span className="text-2xl font-serif font-bold tracking-tight">
                Dhamma Library
              </span>
            </div>
            <p className="text-white/60 leading-relaxed">
              {t.footer.description}
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-serif font-bold mb-6">{t.footer.quickLinks}</h4>
            <ul className="space-y-4 text-white/60">
              <li><a href="#" className="hover:text-zen-orange transition-colors">{t.footer.about}</a></li>
              <li><a href="#" className="hover:text-zen-orange transition-colors">{t.footer.library}</a></li>
              <li>
                <a 
                  href="https://mindful-project.pages.dev/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-zen-orange transition-colors"
                >
                  {t.footer.meditation}
                </a>
              </li>
              <li>
                <a 
                  href="https://drsoelwin.mindset-it.online/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-zen-orange transition-colors"
                >
                  {t.footer.contact}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-serif font-bold mb-6">{t.footer.newsletter}</h4>
            <p className="text-white/60 mb-6">{t.footer.newsletterDesc}</p>
            <form className="flex space-x-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-4 py-3 rounded-full bg-white/10 border border-white/10 focus:outline-none focus:border-zen-orange transition-colors"
              />
              <button className="px-6 py-3 bg-zen-orange rounded-full font-bold hover:bg-zen-orange-light transition-colors">
                {t.footer.join}
              </button>
            </form>
          </div>
        </div>
        
        <div className="mt-20 pt-8 border-t border-white/10 text-center text-white/40 text-sm">
          <p>© {t.footer.rights}</p>
        </div>
      </div>
    </footer>
  );
}
