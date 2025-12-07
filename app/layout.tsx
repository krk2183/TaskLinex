// app/layout.tsx

import './globals.css';
import { Inter } from 'next/font/google';
import Sidebar from '@/components/SideBar';
import { LayoutProvider } from '@/components/LayoutContext';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LayoutProvider>
          <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
              {children}
            </main>
          </div>
        </LayoutProvider>
      </body>
    </html>
  );
}