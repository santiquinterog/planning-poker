import { cn } from '@/lib/cn';

interface ParticipantCardProps {
  name: string;
  hasVoted: boolean;
}

// Figma: carta 35x60. Vacía con contorno cuando no ha votado; rellena en morado cuando sí.
// El valor elegido no se muestra aquí; se revela en otra HU.
export function ParticipantCard({ name, hasVoted }: ParticipantCardProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        role="img"
        aria-label={hasVoted ? `${name} ya eligió carta` : `${name} aún no elige carta`}
        className={cn(
          'h-15 w-9 rounded-lg border border-secondary-purple-300 shadow-card',
          hasVoted ? 'bg-secondary-purple-300 inset-shadow-card' : 'bg-transparent',
        )}
      />
      <span className="text-p3 text-white">{name}</span>
    </div>
  );
}
