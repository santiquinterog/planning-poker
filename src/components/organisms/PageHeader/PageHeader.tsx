import { Logo } from '@/components/atoms/Logo/Logo';

interface PageHeaderProps {
  title: string;
}

// Figma desktop: logo 60px a 80px del borde y título H5 (21px).
// Inferencia mobile: logo 40px, título 18px y padding lateral de 1rem.
export function PageHeader({ title }: PageHeaderProps) {
  return (
    <header className="flex items-center gap-3 px-4 pt-6 md:gap-4 md:px-12 md:pt-9 lg:px-20">
      <Logo alt="" />
      <h1 className="min-w-0 truncate text-lg leading-none font-semibold text-white md:text-h5">
        {title}
      </h1>
    </header>
  );
}
