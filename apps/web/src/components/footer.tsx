'use client';

import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  Mail,
  Send,
  User,
  MessageSquare,
  Sparkles,
  ArrowUp,
  Globe,
  ShieldCheck,
  Heart,
  Github,
  Twitter,
  Linkedin,
} from 'lucide-react';

export function Footer() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSending(true);

    // Simulate sending message with realistic delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    toast.success('Thank you! Your message has been sent successfully.');
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
    setSending(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-background-card border-t border-surface-border mt-20 relative overflow-hidden">
      {/* Subtle Background Glow Accent */}
      <div className="absolute -top-40 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-pink/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Footer Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Brand & Description Column (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="text-3xl font-extrabold tracking-tight">
                <span className="text-primary">Rate</span>
                <span className="text-text-primary">It</span>
              </span>
            </Link>

            <p className="text-text-secondary text-sm leading-relaxed max-w-sm">
              The community-driven platform where real users create listings, share genuine experiences, and rate everything from movies to tech products using category-specific criteria.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-surface hover:bg-surface-light border border-surface-border flex items-center justify-center text-text-secondary hover:text-primary transition-all duration-200"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-surface hover:bg-surface-light border border-surface-border flex items-center justify-center text-text-secondary hover:text-primary transition-all duration-200"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-surface hover:bg-surface-light border border-surface-border flex items-center justify-center text-text-secondary hover:text-primary transition-all duration-200"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>

            <div className="pt-4 flex items-center gap-4 text-xs text-text-muted">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-accent-green" /> 100% Unbiased
              </span>
              <span className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-accent-blue" /> Global Community
              </span>
            </div>
          </div>

          {/* Quick Links Column (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary">
              Navigation
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-text-secondary hover:text-primary transition-colors inline-block"
                >
                  Explore Listings
                </Link>
              </li>
              <li>
                <Link
                  href="/categories"
                  className="text-text-secondary hover:text-primary transition-colors inline-block"
                >
                  All Categories
                </Link>
              </li>
              <li>
                <Link
                  href="/search"
                  className="text-text-secondary hover:text-primary transition-colors inline-block"
                >
                  Search Platform
                </Link>
              </li>
              <li>
                <Link
                  href="/my-reviews"
                  className="text-text-secondary hover:text-primary transition-colors inline-block"
                >
                  My Reviews
                </Link>
              </li>
              <li>
                <Link
                  href="/profile"
                  className="text-text-secondary hover:text-primary transition-colors inline-block"
                >
                  User Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Top Categories Column (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary">
              Top Categories
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/categories/movies"
                  className="text-text-secondary hover:text-primary transition-colors inline-block"
                >
                  Movies & Cinema
                </Link>
              </li>
              <li>
                <Link
                  href="/categories/hotels"
                  className="text-text-secondary hover:text-primary transition-colors inline-block"
                >
                  Hotels & Stays
                </Link>
              </li>
              <li>
                <Link
                  href="/categories/restaurants"
                  className="text-text-secondary hover:text-primary transition-colors inline-block"
                >
                  Restaurants & Dining
                </Link>
              </li>
              <li>
                <Link
                  href="/categories/smartphones"
                  className="text-text-secondary hover:text-primary transition-colors inline-block"
                >
                  Smartphones
                </Link>
              </li>
              <li>
                <Link
                  href="/categories/headphones"
                  className="text-text-secondary hover:text-primary transition-colors inline-block"
                >
                  Headphones & Audio
                </Link>
              </li>
              <li>
                <Link
                  href="/categories/pc-parts"
                  className="text-text-secondary hover:text-primary transition-colors inline-block"
                >
                  PC Components
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Form Column (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary">
                <MessageSquare className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary">
                Get In Touch
              </h3>
            </div>

            <p className="text-xs text-text-muted">
              Have feedback, questions, or suggestion? Send us a message directly!
            </p>

            <form onSubmit={handleContactSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type="text"
                    placeholder="Your Name *"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-surface border border-surface-border rounded-xl text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    required
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type="email"
                    placeholder="Your Email *"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-surface border border-surface-border rounded-xl text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Subject (Optional)"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2.5 bg-surface border border-surface-border rounded-xl text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>

              <div>
                <textarea
                  placeholder="Your Message *"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2.5 bg-surface border border-surface-border rounded-xl text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all min-h-[80px] resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full btn-primary py-2.5 text-xs font-semibold flex items-center justify-center gap-2 group"
              >
                {sending ? (
                  <span>Sending Message...</span>
                ) : (
                  <>
                    <span>Send Message</span>
                    <Send className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Copyright & Back to Top Bar */}
        <div className="mt-16 pt-8 border-t border-surface-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <p>© {new Date().getFullYear()} RateIt. All rights reserved.</p>

          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1 text-text-secondary">
              Built with <Heart className="w-3.5 h-3.5 text-accent-red fill-accent-red" /> for authentic reviews
            </span>

            <button
              onClick={scrollToTop}
              className="flex items-center gap-1.5 hover:text-primary transition-colors py-1 px-2.5 bg-surface hover:bg-surface-light rounded-lg border border-surface-border"
              aria-label="Back to top"
            >
              <span>Back to top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
