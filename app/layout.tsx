
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
          <div className="flex flex-col md:flex-row h-screen bg-gray-100 dark:bg-gray-950">
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