import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/lib/auth-context';
import { Navbar } from '@/components/navbar';
import './globals.css';

export const metadata: Metadata = {
  title: 'RateIt — Rate, Review & Discover Everything',
  description:
    'A community-driven platform for rating and reviewing movies, hotels, restaurants, shops, and technology products.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background">
        <AuthProvider>
          <Navbar />
          <main className="min-h-[calc(100vh-64px)]">{children}</main>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#1A1F2E',
                color: '#F1F5F9',
                border: '1px solid #2D3548',
                borderRadius: '12px',
              },
              success: {
                iconTheme: {
                  primary: '#22C55E',
                  secondary: '#0B0E14',
                },
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#0B0E14',
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
