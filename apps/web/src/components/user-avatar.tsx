'use client';

import { useState } from 'react';
import { User as UserIcon } from 'lucide-react';

interface UserAvatarProps {
  user?: {
    displayName?: string | null;
    username?: string | null;
    email?: string | null;
    avatarUrl?: string | null;
  } | null;
  src?: string | null;
  name?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

const SIZE_MAP = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base font-semibold',
  xl: 'w-20 h-20 text-xl font-bold',
  '2xl': 'w-28 h-28 text-3xl font-extrabold',
};

const GRADIENTS = [
  'from-primary/30 to-accent-blue/30 text-primary-light border-primary/30',
  'from-accent-purple/30 to-accent-pink/30 text-accent-pink border-accent-purple/30',
  'from-accent-green/30 to-accent-blue/30 text-accent-green border-accent-green/30',
  'from-accent-yellow/30 to-accent-red/30 text-accent-yellow border-accent-yellow/30',
  'from-accent-blue/30 to-primary/30 text-accent-blue border-accent-blue/30',
  'from-accent-orange/30 to-accent-pink/30 text-accent-orange border-accent-orange/30',
];

function getInitials(name?: string | null): string {
  if (!name) return '';
  const trimmed = name.trim();
  if (!trimmed) return '';
  const parts = trimmed.split(/\s+/);
  if (parts.length >= 2 && parts[0] && parts[1]) {
    const first = parts[0].charAt(0);
    const second = parts[1].charAt(0);
    return (first + second).toUpperCase();
  }
  return trimmed.slice(0, 2).toUpperCase();
}

function getGradientIndex(str?: string | null): number {
  if (!str) return 0;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % GRADIENTS.length;
}

export function UserAvatar({
  user,
  src,
  name,
  size = 'md',
  className = '',
}: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);

  const avatarSrc = src !== undefined ? src : user?.avatarUrl;
  const effectiveName = name || user?.displayName || user?.username || user?.email || 'User';
  const initials = getInitials(effectiveName);
  const gradientClass = GRADIENTS[getGradientIndex(effectiveName)];
  const sizeClass = SIZE_MAP[size] || SIZE_MAP.md;

  if (avatarSrc && !imageError) {
    return (
      <div
        className={`relative inline-flex items-center justify-center shrink-0 rounded-full overflow-hidden border border-surface-border bg-surface ${sizeClass} ${className}`}
      >
        <img
          src={avatarSrc}
          alt={effectiveName}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover rounded-full"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full font-bold bg-gradient-to-br border uppercase tracking-wider select-none ${sizeClass} ${gradientClass} ${className}`}
      title={effectiveName}
    >
      {initials ? (
        <span>{initials}</span>
      ) : (
        <UserIcon className="w-1/2 h-1/2 opacity-75" />
      )}
    </div>
  );
}
