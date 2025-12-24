import { ReactNode } from 'react';
import { Header } from './Header';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="overflow-x-hidden">
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
