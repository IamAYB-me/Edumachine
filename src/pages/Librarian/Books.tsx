import { useState } from 'react';
import { Search, Plus, Edit, Trash2, Book, Bookmark, Filter, X } from 'lucide-react';
import { cn } from '@/utils';
import { useToastStore } from '@/store/useToastStore';

interface BookItem {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  copies: number;
  available: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

const INITIAL_BOOKS: BookItem[] = [
  { id: '1', title: 'Advanced Mathematics', author: 'Dr. John Doe', isbn: '978-3-16-148410-0', category: 'Science', copies: 10, available: 8, status: 'In Stock' },
  { id: '2', title: 'Modern World History', author: 'Jane Smith', isbn: '978-1-23-456789-0', category: 'History', copies: 5, available: 1, status: 'Low Stock' },
  { id: '3', title: 'English Literature Vol 1', author: 'William Shakespeare', isbn: '978-0-98-765432-1', category: 'Literature', copies: 15, available: 15, status: 'In Stock' },
  { id: '4', title: 'Physics for Beginners', author: 'Albert Einstein', isbn: '978-5-43-210987-6', category: 'Science', copies: 3, available: 0, status: 'Out of Stock' },
  { id: '5', title: 'Introduction to Psychology', author: 'Sigmund Freud', isbn: '978-8-76-543210-9', category: 'Social Science', copies: 8, available: 5, status: 'In Stock' },
];

export default function BooksCatalog() {
  const [books, setBooks] = useState<BookItem[]>(INITIAL_BOOKS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | BookItem['status']>('All');
  const [showModal, setShowModal] = useState(false);
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    category: 'Science',
    copies: 1,
    available: 1,
  });
  const showToast = useToastStore((state) => state.showToast);

  const filteredBooks = books.filter(book => 
    (book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.isbn.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (statusFilter === 'All' || book.status === statusFilter)
  );

  const getStatus = (copies: number, available: number): BookItem['status'] => {
    if (available <= 0) return 'Out of Stock';
    if (available <= Math.max(1, Math.floor(copies / 4))) return 'Low Stock';
    return 'In Stock';
  };

  const resetForm = () => {
    setEditingBookId(null);
    setFormData({
      title: '',
      author: '',
      isbn: '',
      category: 'Science',
      copies: 1,
      available: 1,
    });
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (book: BookItem) => {
    setEditingBookId(book.id);
    setFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      category: book.category,
      copies: book.copies,
      available: book.available,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const cycleFilter = () => {
    setStatusFilter((current) => {
      const order: Array<'All' | BookItem['status']> = ['All', 'In Stock', 'Low Stock', 'Out of Stock'];
      const nextValue = order[(order.indexOf(current) + 1) % order.length];

      showToast({
        title: 'Catalog filter updated',
        description: `Showing ${nextValue.toLowerCase()} books.`,
        variant: 'info',
      });

      return nextValue;
    });
  };

  const handleSaveBook = () => {
    if (!formData.title.trim() || !formData.author.trim() || !formData.isbn.trim()) {
      showToast({
        title: 'Complete book details',
        description: 'Title, author, and ISBN are required.',
        variant: 'warning',
      });
      return;
    }

    const payload: BookItem = {
      id: editingBookId ?? `book-${Date.now()}`,
      ...formData,
      available: Math.min(formData.available, formData.copies),
      status: getStatus(formData.copies, Math.min(formData.available, formData.copies)),
    };

    setBooks((current) =>
      editingBookId ? current.map((book) => (book.id === editingBookId ? payload : book)) : [payload, ...current]
    );

    showToast({
      title: editingBookId ? 'Book updated' : 'Book added',
      description: `${payload.title} is now saved in the library catalog.`,
      variant: 'success',
    });
    closeModal();
  };

  const handleDeleteBook = (bookId: string) => {
    const targetBook = books.find((book) => book.id === bookId);
    setBooks((current) => current.filter((book) => book.id !== bookId));
    showToast({
      title: 'Book removed',
      description: targetBook ? `${targetBook.title} has been removed from the catalog.` : 'The book has been removed.',
      variant: 'warning',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Books Catalog</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage library books, stock levels, and categories.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add New Book
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by title, author, or ISBN..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 dark:text-white"
            />
          </div>
          <button
            onClick={cycleFilter}
            className="flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Filter className="w-4 h-4" />
            {statusFilter === 'All' ? 'All Books' : statusFilter}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr className="border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-6">Book Details</th>
                <th className="py-3 px-6">Category</th>
                <th className="py-3 px-6">ISBN</th>
                <th className="py-3 px-6">Stock Status</th>
                <th className="py-3 px-6">Available</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-800">
              {filteredBooks.map((book) => (
                <tr key={book.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                        <Book className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{book.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">by {book.author}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <Bookmark className="w-4 h-4 text-slate-400" />
                      {book.category}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-slate-600 dark:text-slate-400 font-mono text-xs">
                    {book.isbn}
                  </td>
                  <td className="py-4 px-6">
                    <span className={cn(
                      "inline-block px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      book.status === 'In Stock' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30" :
                      book.status === 'Low Stock' ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30" :
                      "bg-rose-100 text-rose-700 dark:bg-rose-900/30"
                    )}>
                      {book.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">{book.available}</span>
                      <span className="text-slate-400">/ {book.copies} copies</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditModal(book)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteBook(book.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredBooks.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
            No books match the current search and stock filter.
          </div>
        ) : null}
      </div>

      {showModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" onClick={closeModal}>
          <div
            className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{editingBookId ? 'Edit Book' : 'Add New Book'}</h2>
                <p className="text-sm text-slate-500">Manage catalog details, stock levels, and category information.</p>
              </div>
              <button
                onClick={closeModal}
                className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-[70vh] space-y-5 overflow-y-auto px-6 py-6">
              <div className="grid gap-5 md:grid-cols-2">
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>Book Title</span>
                  <input
                    value={formData.title}
                    onChange={(event) => setFormData((current) => ({ ...current, title: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                    placeholder="Book title"
                  />
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>Author</span>
                  <input
                    value={formData.author}
                    onChange={(event) => setFormData((current) => ({ ...current, author: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                    placeholder="Author name"
                  />
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>ISBN</span>
                  <input
                    value={formData.isbn}
                    onChange={(event) => setFormData((current) => ({ ...current, isbn: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                    placeholder="ISBN"
                  />
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>Category</span>
                  <select
                    value={formData.category}
                    onChange={(event) => setFormData((current) => ({ ...current, category: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                  >
                    <option>Science</option>
                    <option>History</option>
                    <option>Literature</option>
                    <option>Social Science</option>
                    <option>Technology</option>
                  </select>
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>Total Copies</span>
                  <input
                    type="number"
                    min={1}
                    value={formData.copies}
                    onChange={(event) => setFormData((current) => ({ ...current, copies: Number(event.target.value) || 1 }))}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                  />
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>Available Copies</span>
                  <input
                    type="number"
                    min={0}
                    max={formData.copies}
                    value={formData.available}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        available: Math.min(Number(event.target.value) || 0, current.copies),
                      }))
                    }
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                  />
                </label>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <button
                onClick={closeModal}
                className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveBook}
                className="rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                {editingBookId ? 'Save Changes' : 'Save Book'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
