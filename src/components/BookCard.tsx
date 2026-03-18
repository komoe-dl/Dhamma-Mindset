import React from 'react';
import { Book } from '../types';
import { getFileUrl } from '../lib/pocketbase';
import { motion } from 'motion/react';

interface BookCardProps {
  book: Book;
  onClick: (book: Book) => void;
}

const BookCard: React.FC<BookCardProps> = ({ book, onClick }) => {
  const coverUrl = getFileUrl(book.collectionId, book.id, book.cover);

  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="group cursor-pointer"
      onClick={() => onClick(book)}
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl shadow-lg transition-shadow group-hover:shadow-2xl bg-zen-gray-light">
        <img
          src={coverUrl}
          alt={book.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
          <p className="text-white font-serif text-lg font-bold leading-tight">{book.title}</p>
          <p className="text-white/80 text-sm mt-1">{book.author}</p>
        </div>
      </div>
      <div className="mt-4 text-center">
        <h3 className="text-zen-gray-dark font-serif font-bold text-lg leading-tight group-hover:text-zen-orange transition-colors">
          {book.title}
        </h3>
        <p className="text-zen-gray text-sm mt-1 italic">{book.author}</p>
      </div>
    </motion.div>
  );
};

export default BookCard;
