import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import pb from '../lib/pocketbase';
import { Book } from '../types';
import { motion } from 'motion/react';
import { useLanguage } from '../lib/LanguageContext';
import DefaultCover from '../components/DefaultCover';
import { sanitizeFileName } from '../lib/utils';
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
  Upload,
  Pencil,
  X,
  Key
} from 'lucide-react';

interface UserRecord {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'student';
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
  const [category, setCategory] = useState('');
  const [googleDocLink, setGoogleDocLink] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [resettingUser, setResettingUser] = useState<UserRecord | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const isAdmin = pb.authStore.isValid && pb.authStore.model?.role === 'admin';
  const isLoggedIn = pb.authStore.isValid;

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [booksList, usersList] = await Promise.all([
          pb.collection('books').getFullList<Book>({ 
            sort: '-created', 
            requestKey: null,
            expand: 'uploaded_by'
          }),
          isAdmin ? pb.collection('users').getFullList<UserRecord>({ sort: '-created', requestKey: null }) : Promise.resolve([])
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
  }, [isLoggedIn, isAdmin, navigate]);

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingBook && !file) {
      setError('Please select a PDF file.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('author', author);
    formData.append('summary', summary);
    formData.append('category', category);
    formData.append('google_doc_link', googleDocLink.trim());
    
    if (file) {
      const sanitizedFile = sanitizeFileName(file, 'dhamma-ebook');
      formData.append('file', sanitizedFile);
    }
    
    if (cover) {
      const sanitizedCover = sanitizeFileName(cover, 'dhamma-cover');
      formData.append('cover', sanitizedCover);
    }

    try {
      if (editingBook) {
        const updatedBook = await pb.collection('books').update<Book>(editingBook.id, formData, {
          expand: 'uploaded_by'
        });
        setBooks(books.map(b => b.id === editingBook.id ? updatedBook : b));
        setSuccess(t.admin.updateSuccess);
        setEditingBook(null);
      } else {
      if (pb.authStore.model?.id) {
        formData.append('uploaded_by', pb.authStore.model.id);
      }
      const newBook = await pb.collection('books').create<Book>(formData, {
        expand: 'uploaded_by'
      });
        setBooks([newBook, ...books]);
        setSuccess(t.admin.addSuccess);
      }
      
      // Reset form
      setTitle('');
      setAuthor('');
      setSummary('');
      setCategory('');
      setGoogleDocLink('');
      setFile(null);
      setCover(null);
    } catch (err: any) {
      console.error('Admin Upload Error:', err);
      if (err.data) {
        console.error('Admin Validation Error Details:', JSON.stringify(err.data, null, 2));
      }
      setError(err.message || `Failed to ${editingBook ? 'update' : 'add'} book.`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (book: Book) => {
    setEditingBook(book);
    setTitle(book.title);
    setAuthor(book.author);
    setSummary(book.summary);
    setCategory(book.category || '');
    setGoogleDocLink(book.google_doc_link || '');
    setFile(null);
    setCover(null);
    setError('');
    setSuccess('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingBook(null);
    setTitle('');
    setAuthor('');
    setSummary('');
    setCategory('');
    setGoogleDocLink('');
    setFile(null);
    setCover(null);
    setError('');
  };

  const handleDeleteBook = async (id: string) => {
    try {
      await pb.collection('books').delete(id);
      setBooks(books.filter(b => b.id !== id));
      setSuccess(t.admin.deleteSuccess);
      setDeletingId(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete book.');
      setDeletingId(null);
    }
  };

  const handleToggleRole = async (user: UserRecord) => {
    setUpdatingUserId(user.id);
    setError('');
    const newRole = user.role === 'admin' ? 'student' : 'admin';
    try {
      const updatedUser = await pb.collection('users').update<UserRecord>(user.id, { role: newRole });
      setUsers(users.map(u => u.id === user.id ? updatedUser : u));
      setSuccess(`Role updated for ${user.email}`);
    } catch (err: any) {
      setError(err.message || 'Failed to update role.');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await pb.collection('users').delete(id);
      setUsers(users.filter(u => u.id !== id));
      setSuccess('User removed successfully.');
      setDeletingUserId(null);
    } catch (err: any) {
      setError(err.message || 'Failed to remove user.');
      setDeletingUserId(null);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resettingUser) return;

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await pb.collection('users').update(resettingUser.id, {
        password: newPassword,
        passwordConfirm: newPassword,
      });
      setSuccess(t.admin.resetPasswordSuccess);
      setResettingUser(null);
      setNewPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to reset password.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = users.filter(user => 
    (user.email?.toLowerCase() || '').includes(userSearchTerm.toLowerCase())
  );

  const categories = [
    { id: 'sutta', label: t.home.categories.sutta },
    { id: 'vinaya', label: t.home.categories.vinaya },
    { id: 'abhidhamma', label: t.home.categories.abhidhamma },
    { id: 'meditation', label: t.home.categories.meditation },
    { id: 'history', label: t.home.categories.history },
  ];

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
          {/* Add/Edit Book Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-zen-gray-light sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  {editingBook ? (
                    <Pencil className="w-5 h-5 text-zen-orange" />
                  ) : (
                    <Plus className="w-5 h-5 text-zen-orange" />
                  )}
                  <h2 className="text-xl font-serif font-bold text-zen-gray-dark">
                    {editingBook ? t.admin.updateBook : t.admin.addBook}
                  </h2>
                </div>
                {editingBook && (
                  <button 
                    onClick={handleCancelEdit}
                    className="p-2 text-zen-gray hover:text-zen-orange transition-colors"
                    title={t.admin.cancel}
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              <form onSubmit={handleAddBook} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-zen-gray-dark uppercase tracking-wider">{t.admin.bookTitle}</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-5 py-4 rounded-xl bg-zen-cream border border-zen-gray-light focus:outline-none focus:ring-2 focus:ring-zen-orange/20 focus:border-zen-orange transition-all text-lg"
                    placeholder={t.admin.bookTitle}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-zen-gray-dark uppercase tracking-wider">{t.admin.author}</label>
                  <input
                    type="text"
                    required
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full px-5 py-4 rounded-xl bg-zen-cream border border-zen-gray-light focus:outline-none focus:ring-2 focus:ring-zen-orange/20 focus:border-zen-orange transition-all text-lg"
                    placeholder={t.admin.author}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-zen-gray-dark uppercase tracking-wider">{t.admin.summary}</label>
                  <textarea
                    required
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    rows={4}
                    className="w-full px-5 py-4 rounded-xl bg-zen-cream border border-zen-gray-light focus:outline-none focus:ring-2 focus:ring-zen-orange/20 focus:border-zen-orange transition-all resize-none text-lg"
                    placeholder={t.admin.summary}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-zen-gray-dark uppercase tracking-wider">{t.admin.category}</label>
                  <select
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-5 py-4 rounded-xl bg-zen-cream border border-zen-gray-light focus:outline-none focus:ring-2 focus:ring-zen-orange/20 focus:border-zen-orange transition-all appearance-none cursor-pointer text-lg"
                  >
                    <option value="" disabled>Select Category</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-zen-gray-dark uppercase tracking-wider">{t.admin.googleDocLink}</label>
                  <input
                    type="url"
                    value={googleDocLink}
                    onChange={(e) => setGoogleDocLink(e.target.value)}
                    className="w-full px-5 py-4 rounded-xl bg-zen-cream border border-zen-gray-light focus:outline-none focus:ring-2 focus:ring-zen-orange/20 focus:border-zen-orange transition-all text-lg"
                    placeholder="https://docs.google.com/document/d/..."
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
                        required={!editingBook}
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
                      <ImageIcon className="w-3 h-3" /> {t.admin.coverImage} (Optional)
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
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

                <div className="flex flex-col space-y-3">
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
                        {editingBook ? <CheckCircle2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                        <span>{editingBook ? t.admin.saveChanges : t.admin.addToLibrary}</span>
                      </>
                    )}
                  </button>
                  
                  {editingBook && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="w-full py-3 border border-zen-gray-light text-zen-gray-dark rounded-xl font-bold hover:bg-zen-cream transition-all"
                    >
                      {t.admin.cancel}
                    </button>
                  )}
                </div>
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
                      <th className="pb-4 font-bold text-xs uppercase tracking-wider text-zen-gray">{t.admin.uploadedBy}</th>
                      <th className="pb-4 font-bold text-xs uppercase tracking-wider text-zen-gray text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zen-gray-light">
                    {books.map((book) => (
                      <tr key={book.id} className="group hover:bg-zen-cream/50 transition-colors">
                        <td className="py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-14 bg-zen-gray-light rounded overflow-hidden flex-shrink-0">
                              {book.cover ? (
                                <img 
                                  src={pb.files.getUrl(book, book.cover)} 
                                  alt="" 
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <DefaultCover title={book.title} author={book.author} className="text-[4px] p-1 space-y-1" />
                              )}
                            </div>
                            <span className="font-medium text-zen-gray-dark">{book.title}</span>
                          </div>
                        </td>
                        <td className="py-4 text-sm text-zen-gray">{book.author}</td>
                        <td className="py-4 text-sm text-zen-gray">
                          {book.expand?.uploaded_by?.name || book.expand?.uploaded_by?.email || '-'}
                        </td>
                        <td className="py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            {deletingId === book.id ? (
                              <div className="flex items-center space-x-2 animate-in fade-in slide-in-from-right-2">
                                <button
                                  onClick={() => handleDeleteBook(book.id)}
                                  className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 transition-colors"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => setDeletingId(null)}
                                  className="px-3 py-1 bg-zen-gray-light text-zen-gray-dark text-xs font-bold rounded-lg hover:bg-zen-gray transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <>
                                {pb.authStore.model?.id === book.uploaded_by && (
                                  <button
                                    onClick={() => handleEditClick(book)}
                                    className="p-2 text-zen-gray hover:text-zen-orange hover:bg-zen-orange/5 rounded-lg transition-all"
                                    title="Edit Book"
                                  >
                                    <Pencil className="w-5 h-5" />
                                  </button>
                                )}
                                {isAdmin && (
                                  <button
                                    onClick={() => setDeletingId(book.id)}
                                    className="p-2 text-zen-gray hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                    title="Delete Book"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* User Management List */}
            {isAdmin && (
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-zen-gray-light">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-zen-orange" />
                    <h2 className="text-xl font-serif font-bold text-zen-gray-dark">User Management</h2>
                  </div>
                  <div className="relative flex-1 max-w-xs">
                    <input
                      type="text"
                      placeholder="Search by email..."
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-zen-cream border border-zen-gray-light focus:outline-none focus:ring-2 focus:ring-zen-orange/20 focus:border-zen-orange transition-all text-sm"
                    />
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zen-gray" />
                  </div>
                  <span className="text-sm text-zen-gray font-medium">{filteredUsers.length} Users</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-zen-gray-light">
                        <th className="pb-4 font-bold text-xs uppercase tracking-wider text-zen-gray">User</th>
                        <th className="pb-4 font-bold text-xs uppercase tracking-wider text-zen-gray">Role</th>
                        <th className="pb-4 font-bold text-xs uppercase tracking-wider text-zen-gray">Joined</th>
                        <th className="pb-4 font-bold text-xs uppercase tracking-wider text-zen-gray text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zen-gray-light">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-zen-cream/50 transition-colors">
                          <td className="py-4">
                            <div className="flex flex-col">
                              <span className="font-medium text-zen-gray-dark">{user.name || 'Anonymous'}</span>
                              <span className="text-xs text-zen-gray">{user.email}</span>
                            </div>
                          </td>
                          <td className="py-4">
                            {user.role === 'admin' ? (
                              <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wider">
                                Admin
                              </span>
                            ) : (
                              <span className="px-2 py-1 rounded-full bg-zen-gray-light text-zen-gray-dark text-[10px] font-bold uppercase tracking-wider">
                                Student
                              </span>
                            )}
                          </td>
                          <td className="py-4 text-sm text-zen-gray">
                            {new Date(user.created).toLocaleDateString()}
                          </td>
                          <td className="py-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              {updatingUserId === user.id ? (
                                <Loader2 className="w-4 h-4 animate-spin text-zen-orange" />
                              ) : (
                                <button
                                  onClick={() => handleToggleRole(user)}
                                  className="p-2 text-zen-gray hover:text-zen-orange hover:bg-zen-orange/5 rounded-lg transition-all"
                                  title={`Make ${user.role === 'admin' ? 'Student' : 'Admin'}`}
                                >
                                  <Users className="w-4 h-4" />
                                </button>
                              )}

                              {pb.authStore.model?.id !== user.id && (
                                <button
                                  onClick={() => setResettingUser(user)}
                                  className="p-2 text-zen-gray hover:text-zen-orange hover:bg-zen-orange/5 rounded-lg transition-all"
                                  title={t.admin.resetPassword}
                                >
                                  <Key className="w-4 h-4" />
                                </button>
                              )}

                              {deletingUserId === user.id ? (
                                <div className="flex items-center space-x-2 animate-in fade-in slide-in-from-right-2">
                                  <button
                                    onClick={() => handleDeleteUser(user.id)}
                                    className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 transition-colors"
                                  >
                                    Confirm
                                  </button>
                                  <button
                                    onClick={() => setDeletingUserId(null)}
                                    className="px-3 py-1 bg-zen-gray-light text-zen-gray-dark text-xs font-bold rounded-lg hover:bg-zen-gray transition-colors"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                pb.authStore.model?.id !== user.id && (
                                  <button
                                    onClick={() => setDeletingUserId(user.id)}
                                    className="p-2 text-zen-gray hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                    title="Remove User"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Reset Password Modal */}
      {resettingUser && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full border border-zen-gray-light"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Key className="w-5 h-5 text-zen-orange" />
                <h3 className="text-xl font-serif font-bold text-zen-gray-dark">{t.admin.resetPassword}</h3>
              </div>
              <button 
                onClick={() => setResettingUser(null)}
                className="p-2 text-zen-gray hover:text-zen-orange transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-zen-gray mb-6">
              Resetting password for: <span className="font-bold text-zen-gray-dark">{resettingUser.email}</span>
            </p>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zen-gray-dark uppercase tracking-wider">{t.signup.password}</label>
                <input
                  type="password"
                  required
                  autoFocus
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-zen-cream border border-zen-gray-light focus:outline-none focus:ring-2 focus:ring-zen-orange/20 focus:border-zen-orange transition-all"
                  placeholder="New password (min 8 chars)"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setResettingUser(null)}
                  className="flex-1 py-3 border border-zen-gray-light text-zen-gray-dark rounded-xl font-bold hover:bg-zen-cream transition-all"
                >
                  {t.admin.cancel}
                </button>
                <button
                  type="submit"
                  disabled={submitting || newPassword.length < 8}
                  className="flex-1 py-3 bg-zen-orange hover:bg-zen-orange-light text-white rounded-xl font-bold transition-all shadow-lg shadow-zen-orange/20 disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {submitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <span>{t.admin.resetPassword}</span>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
