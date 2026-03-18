import React, { useEffect, useState } from 'react';
import pb from '../lib/pocketbase';
import { Book } from '../types';
import Hero from '../components/Hero';
import BookCard from '../components/BookCard';
import BookDetailsModal from '../components/BookDetailsModal';
import { motion } from 'motion/react';
import { Loader2, Search } from 'lucide-react';

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const records = await pb.collection('books').getFullList<Book>({
          sort: '-created',
        });
        setBooks(records);
      } catch (error) {
        console.error('Error fetching books:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      <Hero />

      <section id="library" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-zen-gray-light">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 space-y-6 md:space-y-0">
          <div>
            <h2 className="text-4xl font-serif font-bold text-zen-gray-dark">The Digital Library</h2>
            <p className="text-zen-gray mt-2">Curated wisdom for the modern practitioner.</p>
          </div>
          
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zen-gray" />
            <input
              type="text"
              placeholder="Search by title or author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-full bg-white border border-zen-gray-light focus:outline-none focus:ring-2 focus:ring-zen-orange/20 focus:border-zen-orange transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="w-10 h-10 text-zen-orange animate-spin" />
            <p className="text-zen-gray font-medium">Gathering wisdom...</p>
          </div>
        ) : filteredBooks.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12"
          >
            {filteredBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onClick={setSelectedBook}
              />
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-32">
            <p className="text-zen-gray text-lg">No books found matching your search.</p>
          </div>
        )}
      </section>

      <BookDetailsModal
        book={selectedBook}
        onClose={() => setSelectedBook(null)}
      />
    </div>
  );
}
