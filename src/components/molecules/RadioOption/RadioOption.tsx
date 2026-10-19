import type { InputHTMLAttributes } from 'react';
import { useId } from 'react';
import { cn } from '@/lib/cn';

interface RadioOptionProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'id' | 'children'
> {
  label: string;
}

// Figma: etiqueta a la izquierda y el círculo del radio a la derecha, en morado.
export function RadioOption({ label, className, ...inputProps }: RadioOptionProps) {
  const id = useId();

  return (
    <label
      htmlFor={id}
      className={cn('inline-flex min-h-11 cursor-pointer items-center gap-2', className)}
    >
      <span className="text-p3 text-white">{label}</span>
      <input
        id={id}
        type="radio"
        className="size-5 cursor-pointer appearance-none rounded-full border-2 border-secondary-purple-300 bg-transparent transition-colors checked:border-secondary-purple-300 checked:bg-secondary-purple-300 checked:shadow-[inset_0_0_0_3px_var(--color-primary-purple-700)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-purple-300"
        {...inputProps}
      />
    </label>
  );
}
