import { Avatar } from '@/components/atoms/Avatar/Avatar';

interface PlayerSeatProps {
  name: string;
}

// Figma: avatar del usuario con su nombre debajo del óvalo de la mesa.
export function PlayerSeat({ name }: PlayerSeatProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <Avatar name={name} size="lg" />
      <span className="text-p3 text-white">{name}</span>
    </div>
  );
}
