
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
          {/* -- CHANGE HERE --
            1. Removed the fixed 'bg-[#EBF4DD]'.
            2. Added standard light mode background 'bg-gray-100'.
            3. Added dark mode background 'dark:bg-gray-950'.
            
            These classes now correctly respond to the 'dark' class 
            toggled on the <html> element by the LayoutContext.
          */}
          <div className="flex h-screen bg-gray-100 dark:bg-gray-950">
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