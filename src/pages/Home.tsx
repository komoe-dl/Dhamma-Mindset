import React, { useEffect, useState } from 'react';
import pb from '../lib/pocketbase';
import { Book } from '../types';
import Hero from '../components/Hero';
import BookCard from '../components/BookCard';
import BookDetailsModal from '../components/BookDetailsModal';
import { motion, AnimatePresence } from 'motion/react';
import DefaultCover from '../components/DefaultCover';
import { 
  Loader2, 
  Search, 
  Plus, 
  X, 
  Upload, 
  FileText, 
  ImageIcon, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { useLanguage } from '../lib/LanguageContext';

export default function Home() {
  const { t } = useLanguage();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  
  // Form State
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [summary, setSummary] = useState('');
  const [category, setCategory] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);

  const isLoggedIn = pb.authStore.isValid;

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const records = await pb.collection('books').getFullList<Book>({
          sort: '-created',
          requestKey: null,
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

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setUploadError('Please select a PDF file.');
      return;
    }

    setUploadLoading(true);
    setUploadError('');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('author', author);
    formData.append('summary', summary);
    formData.append('category', category);
    formData.append('file', file);
    formData.append('cover', cover);
    formData.append('uploaded_by', pb.authStore.model?.id);

    try {
      await pb.collection('books').create(formData);
      setUploadSuccess(t.admin.uploadSuccess);
      
      // Reset form
      setTitle('');
      setAuthor('');
      setSummary('');
      setCategory('');
      setFile(null);
      setCover(null);
      
      // Refresh list
      const records = await pb.collection('books').getFullList<Book>({
        sort: '-created',
        requestKey: null,
      });
      setBooks(records);

      // Close modal after delay
      setTimeout(() => {
        setShowUploadModal(false);
        setUploadSuccess('');
      }, 3000);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload book.');
    } finally {
      setUploadLoading(false);
    }
  };

  const filteredBooks = books.filter(book => {
    const matchesSearch = (book.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (book.author?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: 'all', label: t.home.categories.all },
    { id: 'sutta', label: t.home.categories.sutta },
    { id: 'vinaya', label: t.home.categories.vinaya },
    { id: 'abhidhamma', label: t.home.categories.abhidhamma },
    { id: 'meditation', label: t.home.categories.meditation },
    { id: 'biography', label: t.home.categories.biography },
  ];

  return (
    <div className="min-h-screen">
      <Hero />

      <section id="library" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-zen-gray-light">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 space-y-6 md:space-y-0">
          <div>
            <h2 className="text-4xl font-serif font-bold text-zen-gray-dark leading-relaxed">{t.home.title}</h2>
            <p className="text-zen-gray mt-2">{t.home.subtitle}</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            {isLoggedIn && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-zen-orange text-white rounded-full font-bold shadow-lg shadow-zen-orange/20 hover:bg-zen-orange-light transition-all"
              >
                <Plus className="w-5 h-5" />
                <span>{t.admin.uploadBook}</span>
              </button>
            )}
            
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zen-gray" />
              <input
                type="text"
                placeholder={t.home.search}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-full bg-white border border-zen-gray-light focus:outline-none focus:ring-2 focus:ring-zen-orange/20 focus:border-zen-orange transition-all"
              />
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-3 mb-12">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-6 py-2 rounded-full font-bold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-zen-gray-dark text-white shadow-lg'
                  : 'bg-zen-cream text-zen-gray hover:bg-zen-gray-light'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="w-10 h-10 text-zen-orange animate-spin" />
            <p className="text-zen-gray font-medium">{t.home.loading}</p>
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
            <p className="text-zen-gray text-lg">{t.home.noBooks}</p>
          </div>
        )}
      </section>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[2rem] shadow-2xl p-8 max-w-2xl w-full border border-zen-gray-light overflow-y-auto max-h-[90vh]"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-zen-orange/10 rounded-2xl flex items-center justify-center">
                    <Plus className="w-6 h-6 text-zen-orange" />
                  </div>
                  <h2 className="text-2xl font-serif font-bold text-zen-gray-dark">{t.admin.uploadBook}</h2>
                </div>
                <button 
                  onClick={() => setShowUploadModal(false)}
                  className="p-2 text-zen-gray hover:text-zen-orange transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {uploadError && (
                <div className="mb-6 p-4 rounded-2xl bg-red-50 text-red-600 flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {uploadSuccess && (
                <div className="mb-6 p-6 rounded-2xl bg-green-50 text-green-700 flex flex-col items-center text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10" />
                  <span className="text-lg font-bold">{uploadSuccess}</span>
                </div>
              )}

              {!uploadSuccess && (
                <form onSubmit={handleUpload} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-zen-gray-dark uppercase tracking-wider">{t.admin.bookTitle}</label>
                      <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-5 py-4 rounded-2xl bg-zen-cream border border-zen-gray-light focus:outline-none focus:ring-2 focus:ring-zen-orange/20 focus:border-zen-orange transition-all text-lg"
                        placeholder="Enter book title"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-zen-gray-dark uppercase tracking-wider">{t.admin.author}</label>
                      <input
                        type="text"
                        required
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        className="w-full px-5 py-4 rounded-2xl bg-zen-cream border border-zen-gray-light focus:outline-none focus:ring-2 focus:ring-zen-orange/20 focus:border-zen-orange transition-all text-lg"
                        placeholder="Enter author name"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-zen-gray-dark uppercase tracking-wider">{t.admin.category}</label>
                      <select
                        required
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-5 py-4 rounded-2xl bg-zen-cream border border-zen-gray-light focus:outline-none focus:ring-2 focus:ring-zen-orange/20 focus:border-zen-orange transition-all text-lg appearance-none cursor-pointer"
                      >
                        <option value="" disabled>Select Category</option>
                        {categories.filter(c => c.id !== 'all').map(c => (
                          <option key={c.id} value={c.id}>{c.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zen-gray-dark uppercase tracking-wider">{t.admin.summary}</label>
                    <textarea
                      required
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      rows={4}
                      className="w-full px-5 py-4 rounded-2xl bg-zen-cream border border-zen-gray-light focus:outline-none focus:ring-2 focus:ring-zen-orange/20 focus:border-zen-orange transition-all text-lg resize-none"
                      placeholder="Write a brief summary..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-zen-gray-dark uppercase tracking-wider flex items-center gap-2">
                        <FileText className="w-4 h-4" /> {t.admin.pdfFile}
                      </label>
                      <div className="relative">
                        <input
                          type="file"
                          accept=".pdf"
                          required
                          onChange={(e) => setFile(e.target.files?.[0] || null)}
                          className="hidden"
                          id="user-pdf-upload"
                        />
                        <label 
                          htmlFor="user-pdf-upload"
                          className={`flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${file ? 'border-zen-orange bg-zen-orange/5' : 'border-zen-gray-light hover:border-zen-orange'}`}
                        >
                          <Upload className={`w-8 h-8 mb-2 ${file ? 'text-zen-orange' : 'text-zen-gray'}`} />
                          <span className="text-sm text-center font-medium">
                            {file ? file.name : t.admin.choosePdf}
                          </span>
                        </label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-zen-gray-dark uppercase tracking-wider flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" /> {t.admin.coverImage} (Optional)
                      </label>
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setCover(e.target.files?.[0] || null)}
                          className="hidden"
                          id="user-cover-upload"
                        />
                        <label 
                          htmlFor="user-cover-upload"
                          className={`flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${cover ? 'border-zen-orange bg-zen-orange/5' : 'border-zen-gray-light hover:border-zen-orange'}`}
                        >
                          <Upload className={`w-8 h-8 mb-2 ${cover ? 'text-zen-orange' : 'text-zen-gray'}`} />
                          <span className="text-sm text-center font-medium">
                            {cover ? cover.name : t.admin.chooseImage}
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={uploadLoading}
                    className="w-full py-5 bg-zen-orange hover:bg-zen-orange-light text-white rounded-2xl font-bold text-xl transition-all shadow-xl shadow-zen-orange/20 disabled:opacity-50 flex items-center justify-center space-x-3"
                  >
                    {uploadLoading ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span>{t.admin.uploading}</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-6 h-6" />
                        <span>{t.admin.addToLibrary}</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <BookDetailsModal
        book={selectedBook}
        onClose={() => setSelectedBook(null)}
      />
    </div>
  );
}
