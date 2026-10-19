import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type ButtonVariant = 'light' | 'outline' | 'primary';

const BASE_CLASSES =
  'inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full px-6 text-h6 font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-purple-300 disabled:cursor-not-allowed md:min-h-10';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  light:
    'bg-gray-50 text-primary-purple-700 hover:bg-white disabled:bg-gray-400/30 disabled:text-gray-400/60',
  outline: 'border border-gray-50 text-gray-50 hover:bg-gray-50/10',
  primary:
    'bg-primary-purple-500 text-gray-50 shadow-card hover:bg-primary-purple-500/90 disabled:bg-gray-400/30 disabled:text-gray-400/60',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function Button({ variant = 'light', type = 'button', className, ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(BASE_CLASSES, VARIANT_CLASSES[variant], className)}
      {...props}
    />
  );
}
