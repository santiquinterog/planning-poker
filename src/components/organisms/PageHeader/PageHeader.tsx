import type { ReactNode } from 'react';
import { Logo } from '@/components/atoms/Logo/Logo';

interface PageHeaderProps {
  title?: string;
  actions?: ReactNode;
}

// Figma desktop: logo a la izquierda, título centrado (H5) y acciones a la derecha.
// Inferencia mobile: título más pequeño y padding lateral reducido.
export function PageHeader({ title, actions }: PageHeaderProps) {
  return (
    <header className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 pt-6 md:px-12 md:pt-9 lg:px-20">
      <div className="justify-self-start">
        <Logo alt="" />
      </div>
      {title ? (
        <h1 className="col-start-2 min-w-0 truncate text-center text-lg leading-none font-semibold text-white md:text-h5">
          {title}
        </h1>
      ) : (
        <span className="col-start-2" />
      )}
      <div className="col-start-3 justify-self-end">{actions}</div>
    </header>
  );
}
