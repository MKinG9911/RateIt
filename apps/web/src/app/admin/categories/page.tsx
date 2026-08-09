'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, Edit3, ChevronDown, ChevronUp } from 'lucide-react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchCategories = async () => {
    const res = await api<any[]>('/admin/categories');
    if (res.success && res.data) setCategories(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleToggleActive = async (catId: string, current: boolean) => {
    const res = await api(`/admin/categories/${catId}`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive: !current }),
    });
    if (res.success) {
      toast.success('Updated');
      fetchCategories();
    } else toast.error(res.error || 'Failed');
  };

  const handleToggleCriterion = async (critId: string, current: boolean) => {
    const res = await api(`/admin/criteria/${critId}`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive: !current }),
    });
    if (res.success) {
      toast.success('Updated');
      fetchCategories();
    } else toast.error(res.error || 'Failed');
  };

  const handleAddCriterion = async (categoryId: string) => {
    const name = prompt('Criterion name:');
    if (!name) return;
    const description = prompt('Description (optional):') || undefined;
    const res = await api(`/admin/categories/${categoryId}/criteria`, {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    });
    if (res.success) {
      toast.success('Criterion added');
      fetchCategories();
    } else toast.error(res.error || 'Failed');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-text-primary mb-8">Category Management</h1>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="skeleton h-16" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((cat) => (
            <div key={cat.id} className="card">
              <div className="flex items-center justify-between">
                <div
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => setExpandedId(expandedId === cat.id ? null : cat.id)}
                >
                  {expandedId === cat.id ? (
                    <ChevronUp className="w-4 h-4 text-text-muted" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-text-muted" />
                  )}
                  <div>
                    <h3 className="font-semibold text-text-primary">{cat.name}</h3>
                    <p className="text-xs text-text-muted">
                      {cat._count?.listings || 0} listings · {cat.ratingCriteria?.length || 0}{' '}
                      criteria
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cat.isActive ? 'badge-green text-xs' : 'badge-red text-xs'}>
                    {cat.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <button
                    onClick={() => handleToggleActive(cat.id, cat.isActive)}
                    className="text-xs text-primary hover:underline"
                  >
                    {cat.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>

              {expandedId === cat.id && (
                <div className="mt-4 pt-4 border-t border-surface-border">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-text-secondary">Rating Criteria</h4>
                    <button
                      onClick={() => handleAddCriterion(cat.id)}
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add Criterion
                    </button>
                  </div>
                  <div className="space-y-2">
                    {cat.ratingCriteria?.map((criterion: any) => (
                      <div
                        key={criterion.id}
                        className="flex items-center justify-between py-2 px-3 bg-surface rounded-lg"
                      >
                        <div>
                          <span className="text-sm text-text-primary">{criterion.name}</span>
                          {criterion.description && (
                            <p className="text-xs text-text-muted">{criterion.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={
                              criterion.isActive ? 'badge-green text-xs' : 'badge-red text-xs'
                            }
                          >
                            {criterion.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <button
                            onClick={() => handleToggleCriterion(criterion.id, criterion.isActive)}
                            className="text-xs text-primary hover:underline"
                          >
                            {criterion.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
