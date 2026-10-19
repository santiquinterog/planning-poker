import type { CardValue } from '@/contexts/game/domain/card-deck';
import { cn } from '@/lib/cn';

interface ParticipantCardProps {
  name: string;
  vote: CardValue | null;
  // Cuando es true y hay voto, la carta muestra el número (fase "revelado").
  revealed?: boolean;
}

// Figma: carta 35x60. Vacía con contorno si no ha votado; morada si ya votó.
// Al revelar, muestra el número sobre fondo claro con contorno.
export function ParticipantCard({ name, vote, revealed = false }: ParticipantCardProps) {
  const voted = vote !== null;
  const showValue = revealed && voted;

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        role="img"
        aria-label={labelFor(name, vote, showValue)}
        className={cn(
          'flex h-15 w-9 items-center justify-center rounded-lg border border-secondary-purple-300 text-h6 font-bold shadow-card',
          showValue && 'bg-transparent text-white',
          !showValue && voted && 'bg-secondary-purple-300 inset-shadow-card',
          !showValue && !voted && 'bg-transparent',
        )}
      >
        {showValue ? vote : null}
      </div>
      <span className="text-p3 text-white">{name}</span>
    </div>
  );
}

function labelFor(name: string, vote: CardValue | null, showValue: boolean): string {
  if (showValue) {
    return `${name} eligió ${vote}`;
  }
  return vote !== null ? `${name} ya eligió carta` : `${name} aún no elige carta`;
}
