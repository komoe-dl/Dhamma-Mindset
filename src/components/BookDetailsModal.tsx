import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ExternalLink, User, BookOpen } from 'lucide-react';
import { Book } from '../types';
import { getFileUrl } from '../lib/pocketbase';
import { useLanguage } from '../lib/LanguageContext';

interface BookDetailsModalProps {
  book: Book | null;
  onClose: () => void;
}

export default function BookDetailsModal({ book, onClose }: BookDetailsModalProps) {
  const { t } = useLanguage();
  if (!book) return null;

  const fileUrl = getFileUrl(book.collectionId, book.id, book.file);
  const coverUrl = getFileUrl(book.collectionId, book.id, book.cover);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-zen-gray-dark/40 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl bg-zen-cream rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white text-zen-gray-dark shadow-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-full md:w-2/5 h-64 md:h-auto overflow-hidden">
            <img
              src={coverUrl}
              alt={book.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="w-full md:w-3/5 p-8 md:p-12 overflow-y-auto">
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-zen-gray-dark leading-tight">
                  {book.title}
                </h2>
                <div className="flex items-center mt-3 text-zen-orange space-x-2">
                  <User className="w-4 h-4" />
                  <span className="font-medium">{book.author}</span>
                </div>
              </div>

              <div className="prose prose-zen max-w-none">
                <h4 className="text-sm uppercase tracking-widest text-zen-gray font-bold mb-2">{t.modal.summary}</h4>
                <p className="text-zen-gray-dark/80 leading-relaxed text-lg italic">
                  "{book.summary}"
                </p>
              </div>

              <div className="pt-6">
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center space-x-3 bg-zen-orange hover:bg-zen-orange-light text-white px-8 py-4 rounded-full font-bold transition-all transform hover:scale-105 shadow-lg hover:shadow-zen-orange/20"
                >
                  <BookOpen className="w-5 h-5" />
                  <span>{t.modal.readEbook}</span>
                  <ExternalLink className="w-4 h-4 opacity-50" />
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
