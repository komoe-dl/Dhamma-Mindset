import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import pb from '../lib/pocketbase';
import { Book } from '../types';
import { motion } from 'motion/react';
import { useLanguage } from '../lib/LanguageContext';
import { 
  Plus, 
  Trash2, 
  Users, 
  BookOpen, 
  Loader2, 
  AlertCircle, 
  CheckCircle2,
  FileText,
  ImageIcon,
  Upload
} from 'lucide-react';

interface UserRecord {
  id: string;
  email: string;
  name: string;
  created: string;
}

export default function Admin() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [books, setBooks] = useState<Book[]>([]);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [summary, setSummary] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);

  const isAdmin = pb.authStore.isValid && pb.authStore.model?.email === 'madgegoodence911@gmail.com';

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        const [booksList, usersList] = await Promise.all([
          pb.collection('books').getFullList<Book>({ sort: '-created', requestKey: null }),
          pb.collection('users').getFullList<UserRecord>({ sort: '-created', requestKey: null })
        ]);
        setBooks(booksList);
        setUsers(usersList);
      } catch (err) {
        console.error('Error fetching admin data:', err);
        setError('Failed to load data. Please check your permissions.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAdmin, navigate]);

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !cover) {
      setError('Please select both a PDF file and a cover image.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('author', author);
    formData.append('summary', summary);
    formData.append('file', file);
    formData.append('cover', cover);

    try {
      const newBook = await pb.collection('books').create<Book>(formData);
      setBooks([newBook, ...books]);
      setSuccess(t.admin.addSuccess);
      // Reset form
      setTitle('');
      setAuthor('');
      setSummary('');
      setFile(null);
      setCover(null);
    } catch (err: any) {
      setError(err.message || 'Failed to add book.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBook = async (id: string) => {
    if (!window.confirm(t.admin.deleteConfirm)) return;

    try {
      await pb.collection('books').delete(id);
      setBooks(books.filter(b => b.id !== id));
      setSuccess(t.admin.deleteSuccess);
    } catch (err: any) {
      setError(err.message || 'Failed to delete book.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-zen-orange animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-12"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-serif font-bold text-zen-gray-dark">{t.admin.title}</h1>
            <p className="text-zen-gray mt-2">{t.admin.subtitle}</p>
          </div>
          <div className="flex items-center space-x-2 text-sm font-medium text-zen-orange bg-zen-orange/10 px-4 py-2 rounded-full">
            <CheckCircle2 className="w-4 h-4" />
            <span>{t.admin.verified}: {pb.authStore.model?.email}</span>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 text-red-600 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-xl bg-green-50 text-green-600 flex items-start space-x-3">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Book Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-zen-gray-light sticky top-24">
              <div className="flex items-center space-x-2 mb-6">
                <Plus className="w-5 h-5 text-zen-orange" />
                <h2 className="text-xl font-serif font-bold text-zen-gray-dark">{t.admin.addBook}</h2>
              </div>

              <form onSubmit={handleAddBook} className="space-y-5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zen-gray-dark uppercase tracking-wider">{t.admin.bookTitle}</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-zen-cream border border-zen-gray-light focus:outline-none focus:ring-2 focus:ring-zen-orange/20 focus:border-zen-orange transition-all"
                    placeholder={t.admin.bookTitle}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zen-gray-dark uppercase tracking-wider">{t.admin.author}</label>
                  <input
                    type="text"
                    required
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-zen-cream border border-zen-gray-light focus:outline-none focus:ring-2 focus:ring-zen-orange/20 focus:border-zen-orange transition-all"
                    placeholder={t.admin.author}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zen-gray-dark uppercase tracking-wider">{t.admin.summary}</label>
                  <textarea
                    required
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl bg-zen-cream border border-zen-gray-light focus:outline-none focus:ring-2 focus:ring-zen-orange/20 focus:border-zen-orange transition-all resize-none"
                    placeholder={t.admin.summary}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zen-gray-dark uppercase tracking-wider flex items-center gap-1">
                      <FileText className="w-3 h-3" /> {t.admin.pdfFile}
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".pdf"
                        required
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="hidden"
                        id="pdf-upload"
                      />
                      <label 
                        htmlFor="pdf-upload"
                        className={`flex flex-col items-center justify-center w-full p-4 border-2 border-dashed rounded-xl cursor-pointer transition-all ${file ? 'border-zen-orange bg-zen-orange/5' : 'border-zen-gray-light hover:border-zen-orange'}`}
                      >
                        <Upload className={`w-5 h-5 mb-1 ${file ? 'text-zen-orange' : 'text-zen-gray'}`} />
                        <span className="text-[10px] text-center truncate w-full px-2">
                          {file ? file.name : t.admin.choosePdf}
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zen-gray-dark uppercase tracking-wider flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" /> {t.admin.coverImage}
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        required
                        onChange={(e) => setCover(e.target.files?.[0] || null)}
                        className="hidden"
                        id="cover-upload"
                      />
                      <label 
                        htmlFor="cover-upload"
                        className={`flex flex-col items-center justify-center w-full p-4 border-2 border-dashed rounded-xl cursor-pointer transition-all ${cover ? 'border-zen-orange bg-zen-orange/5' : 'border-zen-gray-light hover:border-zen-orange'}`}
                      >
                        <Upload className={`w-5 h-5 mb-1 ${cover ? 'text-zen-orange' : 'text-zen-gray'}`} />
                        <span className="text-[10px] text-center truncate w-full px-2">
                          {cover ? cover.name : t.admin.chooseImage}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-zen-orange hover:bg-zen-orange-light text-white rounded-xl font-bold transition-all shadow-lg shadow-zen-orange/20 disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>{t.admin.uploading}</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      <span>{t.admin.addToLibrary}</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Library & Users Lists */}
          <div className="lg:col-span-2 space-y-8">
            {/* Library Management */}
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-zen-gray-light">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-zen-orange" />
                  <h2 className="text-xl font-serif font-bold text-zen-gray-dark">{t.admin.inventory}</h2>
                </div>
                <span className="text-sm text-zen-gray font-medium">{books.length} {t.admin.booksCount}</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-zen-gray-light">
                      <th className="pb-4 font-bold text-xs uppercase tracking-wider text-zen-gray">{t.nav.library}</th>
                      <th className="pb-4 font-bold text-xs uppercase tracking-wider text-zen-gray">{t.admin.author}</th>
                      <th className="pb-4 font-bold text-xs uppercase tracking-wider text-zen-gray text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zen-gray-light">
                    {books.map((book) => (
                      <tr key={book.id} className="group hover:bg-zen-cream/50 transition-colors">
                        <td className="py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-14 bg-zen-gray-light rounded overflow-hidden flex-shrink-0">
                              <img 
                                src={pb.files.getUrl(book, book.cover)} 
                                alt="" 
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <span className="font-medium text-zen-gray-dark">{book.title}</span>
                          </div>
                        </td>
                        <td className="py-4 text-sm text-zen-gray">{book.author}</td>
                        <td className="py-4 text-right">
                          <button
                            onClick={() => handleDeleteBook(book.id)}
                            className="p-2 text-zen-gray hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete Book"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Student List */}
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-zen-gray-light">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-zen-orange" />
                  <h2 className="text-xl font-serif font-bold text-zen-gray-dark">{t.admin.students}</h2>
                </div>
                <span className="text-sm text-zen-gray font-medium">{users.length} {t.admin.studentsCount}</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-zen-gray-light">
                      <th className="pb-4 font-bold text-xs uppercase tracking-wider text-zen-gray">{t.admin.name}</th>
                      <th className="pb-4 font-bold text-xs uppercase tracking-wider text-zen-gray">{t.admin.email}</th>
                      <th className="pb-4 font-bold text-xs uppercase tracking-wider text-zen-gray text-right">{t.admin.joined}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zen-gray-light">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-zen-cream/50 transition-colors">
                        <td className="py-4 font-medium text-zen-gray-dark">{user.name || 'Anonymous'}</td>
                        <td className="py-4 text-sm text-zen-gray">{user.email}</td>
                        <td className="py-4 text-sm text-zen-gray text-right">
                          {new Date(user.created).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
