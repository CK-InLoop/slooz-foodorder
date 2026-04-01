import type { Metadata } from 'next';
import { Space_Grotesk } from 'next/font/google';
import { ApolloAppProvider } from '@/components/apollo-provider';
import { TopNav } from '@/components/top-nav';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});

export const metadata: Metadata = {
  title: 'Slooz Food Ordering',
  description:
    'Role-based and country-scoped food ordering app built with Next.js and GraphQL.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} h-full antialiased`}>
      <body className="min-h-full bg-slate-50 text-slate-900">
        <ApolloAppProvider>
          <div className="min-h-screen bg-pattern">
            <TopNav />
            <main className="mx-auto w-full max-w-6xl p-4 md:p-6">{children}</main>
          </div>
        </ApolloAppProvider>
      </body>
    </html>
  );
}
