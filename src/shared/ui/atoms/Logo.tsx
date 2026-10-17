import pokerChip from '@/assets/poker-chip.svg';
import { cn } from '@/shared/lib/cn';

interface LogoProps {
  alt?: string;
  className?: string;
}

export function Logo({ alt = 'Planning Poker', className }: LogoProps) {
  return (
    <img
      src={pokerChip}
      alt={alt}
      width={60}
      height={60}
      className={cn('size-10 shrink-0 md:size-15', className)}
    />
  );
}
