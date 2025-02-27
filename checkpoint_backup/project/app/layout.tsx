import './globals.css';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/sonner';
import { SupabaseProvider } from '@/context/supabase-context';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'StudyMind - AI-Powered Learning Platform',
  description: 'Transform your study experience with AI-powered learning tools and personalized assistance.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SupabaseProvider>
          <Providers>
            {children}
            <Toaster />
          </Providers>
        </SupabaseProvider>
      </body>
    </html>
  );
}