import type { ReactNode } from 'react';

interface PageLayoutProps {
  header: ReactNode;
  children: ReactNode;
}

export function PageLayout({ header, children }: PageLayoutProps) {
  return (
    <div className="flex min-h-svh flex-col">
      {header}
      <main className="flex flex-1 items-center justify-center px-4 py-10 md:px-8">{children}</main>
    </div>
  );
}
