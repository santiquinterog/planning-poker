import { useId } from 'react';
import { Input, type InputProps } from '@/components/atoms/Input/Input';

interface TextFieldProps extends Omit<InputProps, 'id'> {
  label: string;
  error?: string | null;
}

export function TextField({ label, error, ...inputProps }: TextFieldProps) {
  const inputId = useId();
  const errorId = `${inputId}-error`;
  const hasError = Boolean(error);

  return (
    <div className="flex w-full min-w-0 flex-col gap-2">
      <label htmlFor={inputId} className="text-p3 font-bold text-white">
        {label}
      </label>
      <Input
        id={inputId}
        aria-invalid={hasError || undefined}
        aria-describedby={hasError ? errorId : undefined}
        {...inputProps}
      />
      <p id={errorId} aria-live="polite" className="min-h-5 px-4 text-p3 text-secondary-purple-300">
        {error}
      </p>
    </div>
  );
}
