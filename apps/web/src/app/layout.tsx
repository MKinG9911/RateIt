import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/lib/auth-context';
import { ThemeProvider } from '@/lib/theme-context';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import './globals.css';

const nunito = localFont({
  src: [
    {
      path: '../../public/fonts/Nunito/Nunito-VariableFont_wght.ttf',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Nunito/Nunito-Italic-VariableFont_wght.ttf',
      style: 'italic',
    },
  ],
  variable: '--font-nunito',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'RateIt — Rate, Review & Discover Everything',
  description:
    'A community-driven platform for rating and reviewing movies, hotels, restaurants, shops, and technology products.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${nunito.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('rateit-theme')||'dark';document.documentElement.classList.remove('light','dark');document.documentElement.classList.add(t);}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-screen bg-background flex flex-col font-sans relative overflow-x-hidden transition-colors duration-200">
        {/* Subtle Brand Background Pattern (Dark theme only) */}
        <div
          className="fixed inset-0 pointer-events-none z-0 bg-repeat transition-opacity duration-300 dark:block hidden"
          style={{
            backgroundImage: "url('/brand-bg.png')",
            opacity: 0.04,
            mixBlendMode: 'screen',
            backgroundSize: '900px auto',
            backgroundPosition: 'center top',
          }}
          aria-hidden="true"
        />

        <ThemeProvider>
          <AuthProvider>
            <div className="relative z-10 flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-1 min-h-[calc(100vh-64px)]">{children}</main>
              <Footer />
            </div>
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
        </ThemeProvider>
      </body>
    </html>
  );
}
