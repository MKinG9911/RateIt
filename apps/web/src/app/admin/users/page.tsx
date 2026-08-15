'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { Shield, ShieldOff } from 'lucide-react';
import { UserAvatar } from '@/components/user-avatar';

export default function AdminUsersPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const fetchUsers = async () => {
    const res = await api<any>('/admin/users', {
      params: { page: String(page), limit: '20', search: search || undefined },
    });
    if (res.success && res.data) setData(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const handleSuspend = async (userId: string) => {
    const reason = prompt('Enter suspension reason:');
    if (!reason) return;
    const res = await api(`/admin/users/${userId}/suspend`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'SUSPENDED', moderationReason: reason }),
    });
    if (res.success) {
      toast.success('User suspended');
      fetchUsers();
    } else toast.error(res.error || 'Failed');
  };

  const handleRestore = async (userId: string) => {
    const res = await api(`/admin/users/${userId}/restore`, { method: 'PATCH' });
    if (res.success) {
      toast.success('User restored');
      fetchUsers();
    } else toast.error(res.error || 'Failed');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-text-primary mb-8">User Management</h1>

      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="input max-w-md"
          placeholder="Search users..."
        />
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="skeleton h-14" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-border">
                <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase">
                  Email
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase">
                  Username
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase">
                  Display Name
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase">
                  Role
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase">
                  Joined
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {data?.items?.map((user: any) => (
                <tr
                  key={user.id}
                  className="border-b border-surface-border hover:bg-surface-light/50 transition-colors"
                >
                  <td className="py-3 px-4 text-sm text-text-primary">
                    <div className="flex items-center gap-2.5">
                      <UserAvatar user={user} size="sm" />
                      <span className="font-medium">{user.email}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-text-secondary">{user.username || '—'}</td>
                  <td className="py-3 px-4 text-sm text-text-secondary">
                    {user.displayName || '—'}
                  </td>
                  <td className="py-3 px-4">
                    <span className="badge-purple text-xs">{user.role}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={
                        user.status === 'ACTIVE' ? 'badge-green text-xs' : 'badge-red text-xs'
                      }
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-text-muted">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    {user.status === 'ACTIVE' ? (
                      <button
                        onClick={() => handleSuspend(user.id)}
                        className="text-xs text-accent-red hover:text-accent-red/80 flex items-center gap-1"
                      >
                        <ShieldOff className="w-3 h-3" /> Suspend
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRestore(user.id)}
                        className="text-xs text-accent-green hover:text-accent-green/80 flex items-center gap-1"
                      >
                        <Shield className="w-3 h-3" /> Restore
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && data.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: data.totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 rounded-lg text-sm ${page === i + 1 ? 'bg-primary text-white' : 'bg-surface text-text-secondary hover:bg-surface-light'}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
