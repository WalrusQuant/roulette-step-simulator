import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { Header } from './components/Header';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Roulette Step Simulator',
    template: '%s | Roulette Step Simulator',
  },
  description:
    'A sophisticated roulette betting strategy simulator with Monte Carlo analysis. Test and analyze multi-step progressive betting systems.',
  keywords: [
    'roulette',
    'simulator',
    'betting',
    'strategy',
    'monte carlo',
    'gambling',
    'probability',
    'casino',
  ],
  authors: [{ name: 'Roulette Simulator' }],
  creator: 'Roulette Simulator',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'Roulette Step Simulator',
    description:
      'Test and analyze roulette betting strategies with Monte Carlo simulations.',
    siteName: 'Roulette Step Simulator',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Roulette Step Simulator',
    description:
      'Test and analyze roulette betting strategies with Monte Carlo simulations.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: '#0D1117',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <footer className="border-t border-casino-border py-6 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-sm text-casino-muted">
                For educational purposes only. Gambling involves risk.
              </p>
              <p className="text-sm text-casino-muted">
                No betting system can overcome the house edge in the long run.
              </p>
            </div>
          </div>
        </footer>
        <Toaster
          position="bottom-right"
          toastOptions={{
            className: '',
            style: {
              background: '#161B22',
              color: '#C9D1D9',
              border: '1px solid #30363D',
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: '#161B22',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#161B22',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
