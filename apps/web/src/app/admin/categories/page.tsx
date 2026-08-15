'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import {
  Plus,
  Edit3,
  Trash2,
  ChevronDown,
  ChevronRight,
  Layers,
  FolderPlus,
  Tag,
  FolderTree,
  Folder,
  FolderOpen,
  Sliders,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { ConfirmDialog } from '@/components/confirm-dialog';

interface Criterion {
  id: string;
  name: string;
  description: string | null;
  displayOrder: number;
  isActive: boolean;
}

interface Subcategory {
  id: string;
  parentId: string | null;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  ratingCriteria: Criterion[];
  _count?: { listings: number };
}

interface ParentCategory {
  id: string;
  parentId: string | null;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  children: Subcategory[];
  ratingCriteria: Criterion[];
  _count?: { listings: number };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<ParentCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedParents, setExpandedParents] = useState<Record<string, boolean>>({});
  const [expandedSubcategories, setExpandedSubcategories] = useState<Record<string, boolean>>({});

  // Modal States
  const [categoryModal, setCategoryModal] = useState<{
    open: boolean;
    mode: 'create_parent' | 'create_sub' | 'edit';
    targetCategory?: {
      id: string;
      name: string;
      description: string | null;
      parentId: string | null;
      isActive: boolean;
    };
    parentId?: string | null;
  }>({ open: false, mode: 'create_parent' });

  const [criterionModal, setCriterionModal] = useState<{
    open: boolean;
    mode: 'create' | 'edit';
    categoryId?: string;
    targetCriterion?: Criterion;
  }>({ open: false, mode: 'create' });

  // Delete Confirm Dialog State
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    type: 'category' | 'criterion';
    id: string;
    name: string;
  }>({ open: false, type: 'category', id: '', name: '' });

  // Form Field States
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formDisplayOrder, setFormDisplayOrder] = useState(0);
  const [formIsActive, setFormIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    const res = await api<ParentCategory[]>('/admin/categories');
    if (res.success && res.data) {
      setCategories(res.data);
      // Auto expand all parent categories and subcategories by default
      const parentExp: Record<string, boolean> = {};
      const subExp: Record<string, boolean> = {};

      res.data.forEach((parent) => {
        parentExp[parent.id] = true;
        parent.children?.forEach((sub) => {
          subExp[sub.id] = true;
        });
      });

      setExpandedParents(parentExp);
      setExpandedSubcategories(subExp);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const toggleParent = (id: string) => {
    setExpandedParents((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSubcategory = (id: string) => {
    setExpandedSubcategories((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // ─── Open Category Modal ──────────────────────────────────────────
  const openCreateParentModal = () => {
    setFormName('');
    setFormDesc('');
    setFormIsActive(true);
    setCategoryModal({ open: true, mode: 'create_parent', parentId: null });
  };

  const openCreateSubModal = (parent: ParentCategory) => {
    setFormName('');
    setFormDesc('');
    setFormIsActive(true);
    setCategoryModal({ open: true, mode: 'create_sub', parentId: parent.id });
  };

  const openEditCategoryModal = (cat: {
    id: string;
    name: string;
    description: string | null;
    parentId: string | null;
    isActive: boolean;
  }) => {
    setFormName(cat.name);
    setFormDesc(cat.description || '');
    setFormIsActive(cat.isActive);
    setCategoryModal({
      open: true,
      mode: 'edit',
      targetCategory: cat,
      parentId: cat.parentId,
    });
  };

  // ─── Open Criterion Modal ──────────────────────────────────────────
  const openCreateCriterionModal = (categoryId: string) => {
    setFormName('');
    setFormDesc('');
    setFormDisplayOrder(0);
    setFormIsActive(true);
    setCriterionModal({ open: true, mode: 'create', categoryId });
  };

  const openEditCriterionModal = (criterion: Criterion) => {
    setFormName(criterion.name);
    setFormDesc(criterion.description || '');
    setFormDisplayOrder(criterion.displayOrder || 0);
    setFormIsActive(criterion.isActive);
    setCriterionModal({ open: true, mode: 'edit', targetCriterion: criterion });
  };

  // ─── Category Submit ──────────────────────────────────────────
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    setSubmitting(true);
    let res;

    if (categoryModal.mode === 'edit' && categoryModal.targetCategory) {
      res = await api(`/admin/categories/${categoryModal.targetCategory.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: formName.trim(),
          description: formDesc.trim() || null,
          isActive: formIsActive,
        }),
      });
    } else {
      res = await api('/admin/categories', {
        method: 'POST',
        body: JSON.stringify({
          name: formName.trim(),
          description: formDesc.trim() || undefined,
          parentId: categoryModal.parentId || undefined,
          isActive: formIsActive,
        }),
      });
    }

    if (res.success) {
      toast.success(
        categoryModal.mode === 'edit'
          ? 'Category updated successfully!'
          : 'Category created successfully!',
      );
      setCategoryModal({ open: false, mode: 'create_parent' });
      fetchCategories();
    } else {
      toast.error(res.error || 'Failed to save category');
    }
    setSubmitting(false);
  };

  // ─── Criterion Submit ──────────────────────────────────────────
  const handleCriterionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    setSubmitting(true);
    let res;

    if (criterionModal.mode === 'edit' && criterionModal.targetCriterion) {
      res = await api(`/admin/criteria/${criterionModal.targetCriterion.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: formName.trim(),
          description: formDesc.trim() || null,
          displayOrder: Number(formDisplayOrder),
          isActive: formIsActive,
        }),
      });
    } else if (criterionModal.categoryId) {
      res = await api(`/admin/categories/${criterionModal.categoryId}/criteria`, {
        method: 'POST',
        body: JSON.stringify({
          name: formName.trim(),
          description: formDesc.trim() || undefined,
          displayOrder: Number(formDisplayOrder),
          isActive: formIsActive,
        }),
      });
    }

    if (res?.success) {
      toast.success(
        criterionModal.mode === 'edit'
          ? 'Criterion updated successfully!'
          : 'Criterion created successfully!',
      );
      setCriterionModal({ open: false, mode: 'create' });
      fetchCategories();
    } else {
      toast.error(res?.error || 'Failed to save criterion');
    }
    setSubmitting(false);
  };

  // ─── Delete Handlers ──────────────────────────────────────────
  const handleConfirmDelete = async () => {
    let res;
    if (deleteConfirm.type === 'category') {
      res = await api(`/admin/categories/${deleteConfirm.id}`, { method: 'DELETE' });
    } else {
      res = await api(`/admin/criteria/${deleteConfirm.id}`, { method: 'DELETE' });
    }

    if (res.success) {
      toast.success(`${deleteConfirm.name} deleted or deactivated!`);
      fetchCategories();
    } else {
      toast.error(res.error || 'Delete operation failed');
    }
    setDeleteConfirm({ open: false, type: 'category', id: '', name: '' });
  };

  // Calculated Stats
  const totalParents = categories.length;
  const totalSubcategories = categories.reduce((acc, cat) => acc + (cat.children?.length || 0), 0);
  const totalCriteria = categories.reduce(
    (acc, cat) =>
      acc + (cat.children?.reduce((subAcc, sub) => subAcc + sub.ratingCriteria.length, 0) || 0),
    0,
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header & Stats Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-surface-dark border border-surface-border p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/20 text-primary border border-primary/30">
              <FolderTree className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary">
                Category & Subcategory Hierarchy
              </h1>
              <p className="text-sm text-text-secondary mt-1">
                Manage parent categories, nested subcategories, and per-category rating criteria dimensions.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={openCreateParentModal}
          className="btn-primary shrink-0 flex items-center gap-2 py-3 px-5 text-sm font-semibold shadow-lg shadow-primary/25"
        >
          <FolderPlus className="w-4 h-4" /> Add Parent Category
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface border border-surface-border p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <Folder className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Parent Categories</p>
            <p className="text-2xl font-bold text-text-primary mt-0.5">{totalParents}</p>
          </div>
        </div>

        <div className="bg-surface border border-surface-border p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 rounded-xl bg-accent-blue/10 text-accent-blue">
            <FolderOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Subcategories</p>
            <p className="text-2xl font-bold text-text-primary mt-0.5">{totalSubcategories}</p>
          </div>
        </div>

        <div className="bg-surface border border-surface-border p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 rounded-xl bg-accent-green/10 text-accent-green">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Rating Criteria</p>
            <p className="text-2xl font-bold text-text-primary mt-0.5">{totalCriteria}</p>
          </div>
        </div>
      </div>

      {/* Categories Tree */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="skeleton h-24 rounded-2xl" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-surface border border-surface-border rounded-2xl text-center py-16 px-4">
          <Layers className="w-12 h-12 text-text-muted mx-auto mb-3" />
          <h3 className="text-lg font-bold text-text-primary">No categories created yet</h3>
          <p className="text-sm text-text-secondary mt-1">Get started by creating your first parent category.</p>
          <button onClick={openCreateParentModal} className="btn-primary mt-5">
            Create First Category
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {categories.map((parent) => {
            const isParentExpanded = !!expandedParents[parent.id];

            return (
              <div
                key={parent.id}
                className="bg-surface border border-surface-border rounded-2xl overflow-hidden shadow-lg transition-all"
              >
                {/* Parent Row */}
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-light/40 border-b border-surface-border">
                  <div
                    className="flex items-center gap-3.5 cursor-pointer select-none flex-1 min-w-0"
                    onClick={() => toggleParent(parent.id)}
                  >
                    <div className="p-2 rounded-xl bg-primary/15 text-primary border border-primary/20">
                      {isParentExpanded ? (
                        <ChevronDown className="w-5 h-5 transition-transform" />
                      ) : (
                        <ChevronRight className="w-5 h-5 transition-transform" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <h2 className="font-extrabold text-lg sm:text-xl text-text-primary truncate">
                          {parent.name}
                        </h2>
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                            parent.isActive
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          }`}
                        >
                          {parent.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      {parent.description && (
                        <p className="text-xs sm:text-sm text-text-secondary mt-1 truncate">
                          {parent.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions for Parent */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
                    <button
                      onClick={() => openCreateSubModal(parent)}
                      className="btn-primary text-xs py-2 px-3 flex items-center gap-1.5 font-medium shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" /> Subcategory
                    </button>

                    <button
                      onClick={() => openEditCategoryModal(parent)}
                      className="p-2 rounded-xl bg-surface hover:bg-surface-light border border-surface-border text-text-secondary hover:text-text-primary transition-colors"
                      title="Edit Category"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() =>
                        setDeleteConfirm({
                          open: true,
                          type: 'category',
                          id: parent.id,
                          name: parent.name,
                        })
                      }
                      className="p-2 rounded-xl bg-surface hover:bg-accent-red/10 border border-surface-border text-text-secondary hover:text-accent-red transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Parent Expanded Content (Subcategories List) */}
                {isParentExpanded && (
                  <div className="p-4 sm:p-6 space-y-4">
                    {parent.children.length === 0 ? (
                      <div className="p-4 bg-background-elevated rounded-xl border border-surface-border text-xs sm:text-sm text-text-secondary flex items-center justify-between">
                        <span>No subcategories created under <strong>{parent.name}</strong> yet.</span>
                        <button
                          onClick={() => openCreateSubModal(parent)}
                          className="text-primary hover:underline font-semibold"
                        >
                          + Add Subcategory
                        </button>
                      </div>
                    ) : (
                      parent.children.map((sub) => {
                        const isSubExpanded = !!expandedSubcategories[sub.id];

                        return (
                          <div
                            key={sub.id}
                            className="bg-background-elevated border border-surface-border/80 rounded-xl p-4 sm:p-5 space-y-4 shadow-sm"
                          >
                            {/* Subcategory Header Row */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div
                                className="flex items-start sm:items-center gap-3 cursor-pointer select-none min-w-0"
                                onClick={() => toggleSubcategory(sub.id)}
                              >
                                <div className="p-1.5 rounded-lg bg-surface text-text-secondary border border-surface-border mt-0.5 sm:mt-0">
                                  {isSubExpanded ? (
                                    <ChevronDown className="w-4 h-4" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2.5 flex-wrap">
                                    <h3 className="font-bold text-base text-text-primary">
                                      {sub.name}
                                    </h3>
                                    <span
                                      className={`text-[11px] px-2 py-0.5 rounded-full font-semibold border ${
                                        sub.isActive
                                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                      }`}
                                    >
                                      {sub.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                  </div>
                                  <p className="text-xs text-text-secondary mt-1">
                                    {sub.description || 'No description provided'}
                                  </p>
                                  <p className="text-[11px] text-text-muted mt-1 font-mono">
                                    {sub._count?.listings || 0} listings · {sub.ratingCriteria.length} criteria dimensions
                                  </p>
                                </div>
                              </div>

                              {/* Actions for Subcategory */}
                              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                                <button
                                  onClick={() => openCreateCriterionModal(sub.id)}
                                  className="text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 border border-primary/30 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                                >
                                  <Plus className="w-3.5 h-3.5" /> Criterion
                                </button>
                                <button
                                  onClick={() => openEditCategoryModal(sub)}
                                  className="p-1.5 rounded-lg bg-surface hover:bg-surface-light border border-surface-border text-text-secondary hover:text-text-primary transition-colors"
                                  title="Edit Subcategory"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    setDeleteConfirm({
                                      open: true,
                                      type: 'category',
                                      id: sub.id,
                                      name: sub.name,
                                    })
                                  }
                                  className="p-1.5 rounded-lg bg-surface hover:bg-accent-red/10 border border-surface-border text-text-secondary hover:text-accent-red transition-colors"
                                  title="Delete Subcategory"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {/* Subcategory Rating Criteria */}
                            {isSubExpanded && (
                              <div className="pt-3 border-t border-surface-border/60 space-y-2.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-text-primary uppercase tracking-wider">
                                    Rating Criteria ({sub.ratingCriteria.length})
                                  </span>
                                </div>

                                {sub.ratingCriteria.length === 0 ? (
                                  <p className="text-xs text-text-muted italic py-1">
                                    No criteria dimensions created yet. Add criteria to enable structured rating for this subcategory.
                                  </p>
                                ) : (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    {sub.ratingCriteria.map((criterion) => (
                                      <div
                                        key={criterion.id}
                                        className="flex items-center justify-between p-3 bg-surface rounded-xl border border-surface-border"
                                      >
                                        <div className="min-w-0 pr-2">
                                          <div className="flex items-center gap-2">
                                            <Tag className="w-3.5 h-3.5 text-primary shrink-0" />
                                            <span className="font-semibold text-xs text-text-primary truncate">
                                              {criterion.name}
                                            </span>
                                            <span
                                              className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                                                criterion.isActive
                                                  ? 'text-emerald-400 bg-emerald-500/10'
                                                  : 'text-rose-400 bg-rose-500/10'
                                              }`}
                                            >
                                              {criterion.isActive ? 'Active' : 'Off'}
                                            </span>
                                          </div>
                                          {criterion.description && (
                                            <p className="text-text-secondary text-[11px] ml-5 truncate mt-0.5">
                                              {criterion.description}
                                            </p>
                                          )}
                                        </div>

                                        <div className="flex items-center gap-1 shrink-0">
                                          <button
                                            onClick={() => openEditCriterionModal(criterion)}
                                            className="p-1 rounded text-text-secondary hover:text-text-primary hover:bg-surface-light"
                                            title="Edit Criterion"
                                          >
                                            <Edit3 className="w-3.5 h-3.5" />
                                          </button>
                                          <button
                                            onClick={() =>
                                              setDeleteConfirm({
                                                open: true,
                                                type: 'criterion',
                                                id: criterion.id,
                                                name: criterion.name,
                                              })
                                            }
                                            className="p-1 rounded text-text-secondary hover:text-accent-red hover:bg-accent-red/10"
                                            title="Delete Criterion"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Category / Subcategory Modal ────────────────────────────────────────── */}
      {categoryModal.open && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background-elevated border border-surface-border rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5">
            <h3 className="text-xl font-bold text-text-primary">
              {categoryModal.mode === 'create_parent'
                ? 'Create Parent Category'
                : categoryModal.mode === 'create_sub'
                ? 'Create Subcategory'
                : 'Edit Category'}
            </h3>

            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div>
                <label className="label text-text-primary font-medium mb-1.5 block">Category Name *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="input text-text-primary placeholder:text-text-muted"
                  placeholder="e.g. Education, Universities"
                  required
                />
              </div>

              <div>
                <label className="label text-text-primary font-medium mb-1.5 block">Description</label>
                <textarea
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="input min-h-[90px] text-text-primary placeholder:text-text-muted resize-y"
                  placeholder="Brief overview of this category..."
                />
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="catActive"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="w-4 h-4 rounded border-surface-border bg-surface text-primary focus:ring-primary"
                />
                <label htmlFor="catActive" className="text-sm font-medium text-text-primary">
                  Active and visible on platform
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-surface-border">
                <button
                  type="button"
                  onClick={() => setCategoryModal({ open: false, mode: 'create_parent' })}
                  className="btn-secondary text-sm"
                >
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn-primary text-sm">
                  {submitting ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Criterion Modal ────────────────────────────────────────── */}
      {criterionModal.open && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background-elevated border border-surface-border rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5">
            <h3 className="text-xl font-bold text-text-primary">
              {criterionModal.mode === 'create' ? 'Add Rating Criterion' : 'Edit Rating Criterion'}
            </h3>

            <form onSubmit={handleCriterionSubmit} className="space-y-4">
              <div>
                <label className="label text-text-primary font-medium mb-1.5 block">Criterion Name *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="input text-text-primary placeholder:text-text-muted"
                  placeholder="e.g. Academic Quality, Camera, Cleanliness"
                  required
                />
              </div>

              <div>
                <label className="label text-text-primary font-medium mb-1.5 block">Description</label>
                <input
                  type="text"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="input text-text-primary placeholder:text-text-muted"
                  placeholder="What users should rate..."
                />
              </div>

              <div>
                <label className="label text-text-primary font-medium mb-1.5 block">Display Order</label>
                <input
                  type="number"
                  value={formDisplayOrder}
                  onChange={(e) => setFormDisplayOrder(Number(e.target.value))}
                  className="input text-text-primary"
                  min={0}
                />
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="critActive"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="w-4 h-4 rounded border-surface-border bg-surface text-primary focus:ring-primary"
                />
                <label htmlFor="critActive" className="text-sm font-medium text-text-primary">
                  Active for user ratings
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-surface-border">
                <button
                  type="button"
                  onClick={() => setCriterionModal({ open: false, mode: 'create' })}
                  className="btn-secondary text-sm"
                >
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn-primary text-sm">
                  {submitting ? 'Saving...' : 'Save Criterion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        open={deleteConfirm.open}
        title={`Delete ${deleteConfirm.type === 'category' ? 'Category' : 'Criterion'}`}
        message={`Are you sure you want to delete or deactivate "${deleteConfirm.name}"? Unused items will be permanently deleted, while items with active data will be marked inactive.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirm({ open: false, type: 'category', id: '', name: '' })}
      />
    </div>
  );
}
