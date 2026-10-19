import { cn } from '@/lib/cn';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'lg';
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<AvatarProps['size']>, string> = {
  sm: 'size-9 text-p3',
  lg: 'size-14 text-h5',
};

function getInitials(name: string): string {
  return name.trim().slice(0, 2).toUpperCase();
}

// Figma: avatar circular indigo claro con iniciales en morado oscuro.
export function Avatar({ name, size = 'sm', className }: AvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-primary-indigo-500 font-bold text-primary-purple-700',
        SIZE_CLASSES[size],
        className,
      )}
    >
      {getInitials(name)}
    </span>
  );
}
