import './globals.css';
import AuthProvider from '@/components/AuthProvider';
import HeaderWrapper from '@/components/HeaderWrapper';

export const metadata = {
  title: 'GigVerse - Freelance Marketplace',
  description: 'A platform to offer and hire freelance services securely.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-background text-secondary">
        <AuthProvider>
          <HeaderWrapper />
          <main className="flex-1">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
