import type { InputHTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

// Inferencia mobile: texto de 16px para evitar el zoom automático de iOS; 14px (Figma) desde md.
export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'h-11 w-full min-w-0 rounded-full border border-secondary-purple-300 bg-primary-purple-500/8 pr-1 pl-4 text-base text-white transition-shadow outline-none placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-secondary-purple-300/60 md:h-10 md:text-p3',
        className,
      )}
      {...props}
    />
  );
}
