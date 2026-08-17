'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import {
  Search,
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  Star,
  Package,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  Building2,
  Film,
  UtensilsCrossed,
  ShoppingBag,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  education: <GraduationCap className="w-4 h-4 text-accent-blue" />,
  technology: <Cpu className="w-4 h-4 text-accent-green" />,
  hotels: <Building2 className="w-4 h-4 text-accent-blue" />,
  hospitality: <Building2 className="w-4 h-4 text-accent-blue" />,
  movies: <Film className="w-4 h-4 text-primary-light" />,
  entertainment: <Film className="w-4 h-4 text-primary-light" />,
  restaurants: <UtensilsCrossed className="w-4 h-4 text-accent-red" />,
  dining: <UtensilsCrossed className="w-4 h-4 text-accent-red" />,
  shops: <ShoppingBag className="w-4 h-4 text-accent-green" />,
  retail: <ShoppingBag className="w-4 h-4 text-accent-green" />,
};

interface Subcategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  _count?: { listings: number };
}

interface ParentCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  children: Subcategory[];
  _count?: { listings: number };
}

import { UserAvatar } from '@/components/user-avatar';
import { ThemeToggle } from '@/components/theme-toggle';

export function Navbar() {
  const { appUser, supabaseUser, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);
  const [categories, setCategories] = useState<ParentCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const dropdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  const refreshCategories = useCallback(async () => {
    const res = await api<ParentCategory[]>('/categories');
    if (res.success && res.data) setCategories(res.data);
  }, []);

  useEffect(() => {
    refreshCategories();
  }, [pathname, refreshCategories]);

  const handleMouseEnterCategories = () => {
    if (dropdownTimerRef.current) clearTimeout(dropdownTimerRef.current);
    setCategoriesDropdownOpen(true);
    refreshCategories();
  };

  const handleMouseLeaveCategories = () => {
    dropdownTimerRef.current = setTimeout(() => {
      setCategoriesDropdownOpen(false);
    }, 150);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setUserMenuOpen(false);
    router.push('/');
  };

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-surface-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-2xl font-extrabold font-heading tracking-tight">
              <span className="text-primary">Rate</span>
              <span className="text-text-primary">It</span>
            </span>
          </Link>

          {/* Nav links — desktop */}
          <div className="hidden md:flex items-center gap-1 ml-8">
            <Link
              href="/"
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                pathname === '/' ? 'text-primary bg-primary/10' : 'text-text-secondary hover:text-text-primary hover:bg-surface-light'
              }`}
            >
              Explore
            </Link>

            {/* Categories Dropdown Trigger */}
            <div
              className="relative"
              onMouseEnter={handleMouseEnterCategories}
              onMouseLeave={handleMouseLeaveCategories}
            >
              <Link
                href="/categories"
                className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isActive('/categories') || categoriesDropdownOpen
                    ? 'text-primary bg-primary/10'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-light'
                }`}
              >
                <span>Categories</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    categoriesDropdownOpen ? 'rotate-180 text-primary' : 'text-text-muted'
                  }`}
                />
              </Link>

              {/* Categories Mega Dropdown Box */}
              {categoriesDropdownOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-[680px] bg-background-elevated/95 backdrop-blur-xl border border-surface-border rounded-2xl shadow-2xl z-50 p-6 space-y-6">
                  {/* Category Grid */}
                  <div className="grid grid-cols-3 gap-6">
                    {categories.map((parent) => (
                      <div key={parent.id} className="space-y-2.5">
                        {/* Parent Title */}
                        <div className="flex items-center justify-between pb-1.5 border-b border-surface-border">
                          <div className="flex items-center gap-2 min-w-0">
                            {CATEGORY_ICONS[parent.slug] || <Layers className="w-4 h-4 text-primary shrink-0" />}
                            <Link
                              href={`/categories/${parent.slug}`}
                              onClick={() => setCategoriesDropdownOpen(false)}
                              className="font-bold text-xs text-text-primary uppercase tracking-wider hover:text-primary transition-colors truncate"
                            >
                              {parent.name}
                            </Link>
                          </div>
                          {parent._count?.listings !== undefined && (
                            <span className="text-[10px] text-text-muted bg-surface px-1.5 py-0.5 rounded font-mono shrink-0 border border-surface-border/60">
                              {parent._count.listings}
                            </span>
                          )}
                        </div>

                        {/* Subcategories List */}
                        <ul className="space-y-1.5">
                          {parent.children && parent.children.length > 0 ? (
                            parent.children.map((sub) => (
                              <li key={sub.id}>
                                <Link
                                  href={`/categories/${sub.slug}`}
                                  onClick={() => setCategoriesDropdownOpen(false)}
                                  className="flex items-center justify-between text-xs text-text-secondary hover:text-text-primary hover:bg-surface-light px-2 py-1.5 rounded-lg transition-colors group"
                                >
                                  <span className="truncate group-hover:translate-x-0.5 transition-transform">
                                    {sub.name}
                                  </span>
                                  {sub._count?.listings !== undefined && (
                                    <span className="text-[10px] text-text-muted bg-surface px-1.5 py-0.5 rounded font-mono">
                                      {sub._count.listings}
                                    </span>
                                  )}
                                </Link>
                              </li>
                            ))
                          ) : (
                            <li>
                              <Link
                                href={`/categories/${parent.slug}`}
                                onClick={() => setCategoriesDropdownOpen(false)}
                                className="text-xs text-text-muted hover:text-primary block py-1"
                              >
                                View {parent.name}
                              </Link>
                            </li>
                          )}
                        </ul>
                      </div>
                    ))}
                  </div>

                  {/* Mega Menu Footer Banner */}
                  <div className="pt-3 border-t border-surface-border flex items-center justify-between text-xs text-text-secondary">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-primary" /> Community ratings across all categories
                    </span>
                    <Link
                      href="/categories"
                      onClick={() => setCategoriesDropdownOpen(false)}
                      className="text-primary hover:underline font-semibold flex items-center gap-1"
                    >
                      Browse All Categories <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Search bar — desktop */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex items-center flex-1 max-w-md mx-6"
          >
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search anything..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-surface border border-surface-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
          </form>

          {/* Right side — desktop */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />

            {loading ? (
              <div className="w-8 h-8 skeleton rounded-full" />
            ) : supabaseUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-surface-light transition-colors"
                >
                  <UserAvatar user={appUser} size="sm" />
                  <span className="text-sm font-medium text-text-primary max-w-[150px] truncate">
                    {appUser?.displayName || appUser?.username || appUser?.email || supabaseUser?.email}
                  </span>
                  <ChevronDown className="w-4 h-4 text-text-muted" />
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-60 bg-background-elevated border border-surface-border rounded-2xl shadow-2xl z-50 py-2">
                      <div className="px-4 py-3 border-b border-surface-border flex items-center gap-3">
                        <UserAvatar user={appUser} size="md" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-text-primary truncate">
                            {appUser?.displayName || appUser?.username || appUser?.email || supabaseUser?.email}
                          </p>
                          <p className="text-xs text-text-muted truncate">{supabaseUser.email}</p>
                          {appUser?.role === 'ADMIN' && (
                            <span className="badge-purple text-[10px] py-0.5 mt-1 inline-block">
                              Admin
                            </span>
                          )}
                        </div>
                      </div>

                      <Link
                        href="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-light transition-colors"
                      >
                        <User className="w-4 h-4" /> Profile Settings
                      </Link>

                      {appUser?.role !== 'ADMIN' && (
                        <Link
                          href="/my-reviews"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-light transition-colors"
                        >
                          <Star className="w-4 h-4" /> My Reviews
                        </Link>
                      )}

                      {appUser?.role === 'ADMIN' && (
                        <>
                          <div className="border-t border-surface-border my-1" />
                          <Link
                            href="/admin/listings"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-light transition-colors"
                          >
                            <Package className="w-4 h-4" /> Manage Listings
                          </Link>
                          <Link
                            href="/admin"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-primary hover:bg-surface-light transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
                          </Link>
                        </>
                      )}

                      <div className="border-t border-surface-border my-1" />
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-accent-red hover:bg-surface-light transition-colors w-full"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/auth/login" className="btn-ghost text-sm">
                  Login
                </Link>
                <Link href="/auth/register" className="btn-primary text-sm">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle & Theme Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              className="p-2 rounded-lg hover:bg-surface-light transition-colors text-text-primary"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-surface-border py-4 space-y-3">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-surface border border-surface-border rounded-xl text-sm"
                />
              </div>
            </form>

            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-light"
            >
              Explore
            </Link>

            {/* Mobile Categories Accordion */}
            <div>
              <button
                onClick={() => {
                  const nextState = !mobileCategoriesOpen;
                  setMobileCategoriesOpen(nextState);
                  if (nextState) refreshCategories();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-light"
              >
                <span>Categories</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${mobileCategoriesOpen ? 'rotate-180' : ''}`} />
              </button>

              {mobileCategoriesOpen && (
                <div className="pl-4 pr-2 py-2 space-y-3 border-l-2 border-primary/30 ml-3 my-1">
                  {categories.map((parent) => (
                    <div key={parent.id} className="space-y-1">
                      <div className="flex items-center justify-between pt-1">
                        <p className="text-xs font-bold text-text-primary uppercase tracking-wider">
                          {parent.name}
                        </p>
                        {parent._count?.listings !== undefined && (
                          <span className="text-[10px] text-text-muted font-mono bg-surface px-1.5 py-0.5 rounded">
                            {parent._count.listings}
                          </span>
                        )}
                      </div>
                      {parent.children?.map((sub) => (
                        <Link
                          key={sub.id}
                          href={`/categories/${sub.slug}`}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center justify-between text-xs text-text-secondary hover:text-primary py-1 pl-2 pr-1"
                        >
                          <span>• {sub.name}</span>
                          {sub._count?.listings !== undefined && (
                            <span className="text-[10px] text-text-muted font-mono">
                              {sub._count.listings}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  ))}
                  <Link
                    href="/categories"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-xs text-primary font-bold pt-2"
                  >
                    All Categories →
                  </Link>
                </div>
              )}
            </div>

            {supabaseUser ? (
              <>
                <div className="border-t border-surface-border my-2" />
                <div className="px-3 py-2.5 flex items-center gap-3 bg-surface/60 rounded-xl mb-2 border border-surface-border/50">
                  <UserAvatar user={appUser} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-text-primary truncate">
                      {appUser?.displayName || appUser?.username || appUser?.email || supabaseUser?.email}
                    </p>
                    <p className="text-xs text-text-muted truncate">{supabaseUser.email}</p>
                  </div>
                </div>

                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-surface-light"
                >
                  Profile Settings
                </Link>
                {appUser?.role !== 'ADMIN' && (
                  <Link
                    href="/my-reviews"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-surface-light"
                  >
                    My Reviews
                  </Link>
                )}
                {appUser?.role === 'ADMIN' && (
                  <>
                    <Link
                      href="/admin/listings"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-surface-light"
                    >
                      Manage Listings
                    </Link>
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-lg text-sm text-primary hover:bg-surface-light"
                    >
                      Admin Dashboard
                    </Link>
                  </>
                )}
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-accent-red hover:bg-surface-light"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <div className="border-t border-surface-border my-2" />
                <div className="flex gap-3 px-3">
                  <Link
                    href="/auth/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-secondary flex-1 text-center text-sm"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-primary flex-1 text-center text-sm"
                  >
                    Register
                  </Link>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
