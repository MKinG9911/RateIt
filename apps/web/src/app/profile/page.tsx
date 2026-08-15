'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { User, Mail, Shield, AtSign, UserCheck, HelpCircle } from 'lucide-react';
import { AvatarUploader } from '@/components/avatar-uploader';
import { UserAvatar } from '@/components/user-avatar';

export default function ProfilePage() {
  const { appUser, supabaseUser, loading, refreshUser } = useAuth();
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (appUser) {
      setUsername(appUser.username || '');
      setDisplayName(appUser.displayName || '');
      setAvatarUrl(appUser.avatarUrl || '');
    }
  }, [appUser]);

  const handleAvatarChange = async (newUrl: string) => {
    setAvatarUrl(newUrl);
    // Automatically persist avatar change to backend and refresh globally
    try {
      const res = await api('/users/me', {
        method: 'PATCH',
        body: JSON.stringify({ avatarUrl: newUrl || '' }),
      });
      if (res.success) {
        await refreshUser();
      }
    } catch (e) {
      console.warn('Auto-save avatar error:', e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await api('/users/me', {
      method: 'PATCH',
      body: JSON.stringify({
        username: username || undefined,
        displayName: displayName || undefined,
        avatarUrl: avatarUrl || '',
      }),
    });
    if (res.success) {
      toast.success('Profile updated successfully!');
      await refreshUser();
    } else {
      toast.error(res.error || 'Failed to update profile');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-text-primary mb-2">Profile Settings</h1>
      <p className="text-text-secondary mb-8">Manage your account identity, profile photo, and public details</p>

      {/* User Info Card */}
      <div className="card mb-8">
        <div className="flex items-center gap-4 mb-6">
          <UserAvatar user={appUser} src={avatarUrl} size="lg" />
          <div>
            <h2 className="text-xl font-bold text-text-primary">
              {appUser?.displayName || appUser?.email || supabaseUser?.email}
            </h2>
            <p className="text-sm text-text-secondary flex items-center gap-2 mt-0.5">
              <Mail className="w-4 h-4 text-text-muted" /> {appUser?.email}
            </p>
            <div className="flex gap-2 mt-2">
              <span className="badge-purple">{appUser?.role}</span>
              <span className={appUser?.status === 'ACTIVE' ? 'badge-green' : 'badge-red'}>
                {appUser?.status}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-6 pt-6 border-t border-surface-border">
          {/* Avatar Uploader with Cropper & Storage Cleanup */}
          <AvatarUploader value={avatarUrl} onChange={handleAvatarChange} user={appUser} />

          <div className="pt-2">
            <label htmlFor="username" className="label flex items-center gap-2">
              <AtSign className="w-4 h-4 text-primary" /> Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input"
              placeholder="e.g. alex_99"
              minLength={3}
              maxLength={30}
              pattern="^[a-zA-Z0-9_-]+$"
            />
            <p className="text-xs text-text-muted mt-1.5">
              Unique handle (3–30 characters). Letters, numbers, hyphens, and underscores only.
            </p>
          </div>

          <div>
            <label htmlFor="displayName" className="label flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-accent-green" /> Display Name
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="input"
              placeholder="e.g. Alex Smith"
              maxLength={100}
            />
            <p className="text-xs text-text-muted mt-1.5">
              Your public full name shown on your reviews and listings.
            </p>
          </div>

          <button type="submit" disabled={saving} className="btn-primary py-3 px-8">
            {saving ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Explanation Guide */}
      <div className="card bg-surface/50 border-surface-border">
        <h3 className="text-base font-semibold text-text-primary mb-3 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-primary" /> How Names Work on RateIt
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="p-4 bg-background rounded-xl border border-surface-border">
            <h4 className="font-medium text-primary mb-1 flex items-center gap-1.5">
              <AtSign className="w-4 h-4" /> Username
            </h4>
            <p className="text-text-secondary text-xs leading-relaxed">
              Your unique identifier across the platform. Used for profile URLs and system references. Must be unique.
            </p>
          </div>
          <div className="p-4 bg-background rounded-xl border border-surface-border">
            <h4 className="font-medium text-accent-green mb-1 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4" /> Display Name
            </h4>
            <p className="text-text-secondary text-xs leading-relaxed">
              Your friendly public name shown next to your ratings and reviews. If left blank, your Username or Email will be shown instead.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
