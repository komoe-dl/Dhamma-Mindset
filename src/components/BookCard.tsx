import React from 'react';
import { Book } from '../types';
import { getFileUrl } from '../lib/pocketbase';
import { motion } from 'motion/react';
import { useLanguage } from '../lib/LanguageContext';
import DefaultCover from './DefaultCover';

interface BookCardProps {
  book: Book;
  onClick: (book: Book) => void;
}

const BookCard: React.FC<BookCardProps> = ({ book, onClick }) => {
  const { t } = useLanguage();
  const coverUrl = book.cover ? getFileUrl(book.collectionId, book.id, book.cover) : null;

  const getCategoryLabel = (cat?: string) => {
    if (!cat) return null;
    return t.home.categories[cat] || cat;
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="group cursor-pointer"
      onClick={() => onClick(book)}
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl shadow-lg transition-shadow group-hover:shadow-2xl bg-zen-gray-light">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={book.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
        ) : (
          <DefaultCover title={book.title} author={book.author} />
        )}
        
        {book.category && (
          <div className="absolute top-4 left-4 z-10">
            <span className="px-3 py-1.5 rounded-full bg-red-900/90 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-sm shadow-lg">
              {getCategoryLabel(book.category)}
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
          <p className="text-white font-serif text-lg font-bold leading-snug">{book.title}</p>
          <p className="text-white/80 text-sm mt-1">{book.author}</p>
        </div>
      </div>
      <div className="mt-4 text-center">
        <h3 className="text-zen-gray-dark font-serif font-bold text-lg leading-snug group-hover:text-zen-orange transition-colors">
          {book.title}
        </h3>
        <p className="text-zen-gray text-sm mt-1 italic">{book.author}</p>
      </div>
    </motion.div>
  );
};

export default BookCard;
