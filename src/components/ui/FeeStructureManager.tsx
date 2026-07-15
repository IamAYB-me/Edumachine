import React, { useMemo, useState } from 'react';
import { BookOpen, Edit2, Plus, Trash2, Wallet, X } from 'lucide-react';
import { cn } from '@/utils';
import { FeeStructure, useDataStore } from '@/store/useDataStore';
import { useToastStore } from '@/store/useToastStore';

interface FeeStructureManagerProps {
  title?: string;
  description?: string;
  className?: string;
}

export function FeeStructureManager({
  title = 'Fee Categories By Class',
  description = 'Set fee categories and payable amounts for each class.',
  className,
}: FeeStructureManagerProps) {
  const { classes, feeStructures, addFeeStructure, updateFeeStructure, deleteFeeStructure } = useDataStore();
  const showToast = useToastStore((state) => state.showToast);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState('All Classes');
  const [editingStructure, setEditingStructure] = useState<FeeStructure | null>(null);
  const [formData, setFormData] = useState<Omit<FeeStructure, 'id'>>({
    className: classes[0]?.name ?? '',
    category: '',
    amount: 0,
    term: 'First Term',
    description: '',
    status: 'Active',
  });

  const filteredStructures = useMemo(() => {
    return selectedClass === 'All Classes'
      ? feeStructures
      : feeStructures.filter((item) => item.className === selectedClass);
  }, [feeStructures, selectedClass]);

  const totals = useMemo(() => {
    const activeStructures = feeStructures.filter((item) => item.status === 'Active');
    const totalAmount = filteredStructures.reduce((sum, item) => sum + item.amount, 0);
    return {
      activeCount: activeStructures.length,
      classCount: new Set(feeStructures.map((item) => item.className)).size,
      totalAmount,
    };
  }, [feeStructures, filteredStructures]);

  const resetForm = () => {
    setEditingStructure(null);
    setFormData({
      className: classes[0]?.name ?? '',
      category: '',
      amount: 0,
      term: 'First Term',
      description: '',
      status: 'Active',
    });
  };

  const openCreateModal = () => {
    resetForm();
    if (selectedClass !== 'All Classes') {
      setFormData((current) => ({ ...current, className: selectedClass }));
    }
    setIsModalOpen(true);
  };

  const openEditModal = (structure: FeeStructure) => {
    setEditingStructure(structure);
    setFormData({
      className: structure.className,
      category: structure.category,
      amount: structure.amount,
      term: structure.term,
      description: structure.description ?? '',
      status: structure.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingStructure) {
      updateFeeStructure(editingStructure.id, formData);
      showToast({
        title: 'Fee category updated',
        description: `${formData.category} for ${formData.className} has been updated.`,
        variant: 'success',
      });
    } else {
      addFeeStructure(formData);
      showToast({
        title: 'Fee category added',
        description: `${formData.category} has been created for ${formData.className}.`,
        variant: 'success',
      });
    }

    setIsModalOpen(false);
    resetForm();
  };

  const handleDelete = (id: string, category: string, feeClass: string) => {
    deleteFeeStructure(id);
    showToast({
      title: 'Fee category removed',
      description: `${category} for ${feeClass} has been deleted from the fee setup.`,
      variant: 'warning',
    });
  };

  return (
    <div className={cn('rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900', className)}>
      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 px-8 py-6 dark:border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {editingStructure ? 'Edit Fee Category' : 'Add Fee Category'}
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Assign a fee category and amount to a class.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="rounded-2xl p-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-8">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Class</label>
                  <select
                    required
                    value={formData.className}
                    onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {classes.map((item) => (
                      <option key={item.id} value={item.name}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Term</label>
                  <select
                    value={formData.term}
                    onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option>First Term</option>
                    <option>Second Term</option>
                    <option>Third Term</option>
                    <option>Full Session</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Fee Category</label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. Tuition Fee"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Amount</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    placeholder="0.00"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition-all focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as FeeStructure['status'] })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Notes</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optional fee description"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="flex-1 rounded-2xl border border-slate-200 px-6 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-900/20 transition-all hover:bg-blue-700"
                >
                  {editingStructure ? 'Update Category' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-900/20 transition-all hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Manage Fee Categories
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-3xl bg-slate-50 p-5 dark:bg-slate-800/60">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Active Categories</p>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{totals.activeCount}</p>
        </div>
        <div className="rounded-3xl bg-slate-50 p-5 dark:bg-slate-800/60">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Classes Covered</p>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{totals.classCount}</p>
        </div>
        <div className="rounded-3xl bg-slate-50 p-5 dark:bg-slate-800/60">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Visible Setup Total</p>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{totals.totalAmount.toLocaleString()}</p>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex items-center gap-2 rounded-2xl bg-blue-50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
          <BookOpen className="h-4 w-4" />
          Class Fee Setup
        </div>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-900 outline-none transition-all focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        >
          <option>All Classes</option>
          {classes.map((item) => (
            <option key={item.id} value={item.name}>
              {item.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        {filteredStructures.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 px-6 py-12 text-center dark:border-slate-700">
            <Wallet className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
            <p className="mt-4 text-sm font-bold text-slate-900 dark:text-white">No fee categories configured yet.</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Use the button above to assign fee categories and amounts to each class.</p>
          </div>
        ) : (
          filteredStructures.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-4 rounded-3xl border border-slate-200 p-5 transition-colors hover:border-blue-200 dark:border-slate-800 dark:hover:border-blue-900/60 lg:flex-row lg:items-center lg:justify-between"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-xl bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {item.className}
                  </span>
                  <span className="rounded-xl bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    {item.term}
                  </span>
                  <span
                    className={cn(
                      'rounded-xl px-3 py-1 text-[10px] font-bold uppercase tracking-wider',
                      item.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                    )}
                  >
                    {item.status}
                  </span>
                </div>
                <div>
                  <p className="text-base font-bold text-slate-900 dark:text-white">{item.category}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{item.description || 'No additional notes provided.'}</p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 lg:justify-end">
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Amount</p>
                  <p className="text-xl font-black text-slate-900 dark:text-white">{item.amount.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(item)}
                    className="rounded-2xl p-3 text-slate-400 transition-all hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.category, item.className)}
                    className="rounded-2xl p-3 text-slate-400 transition-all hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
