import { CARD_DECK, type CardValue } from '@/contexts/game/domain/card-deck';
import { cn } from '@/lib/cn';

interface CardListProps {
  // El admin ve las cartas pero no interactúa; el jugador sí (HU posterior).
  interactive: boolean;
  selectedValue?: CardValue | null;
  onSelect?: (value: CardValue) => void;
}

// Figma: fila "Elige una carta" con las cartas de estimación bajo la mesa.
// Inferencia mobile: las cartas hacen wrap y conservan el área táctil mínima.
export function CardList({ interactive, selectedValue = null, onSelect }: CardListProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-h6 font-semibold text-white">Elige una carta 👇</p>
      <ul className="flex flex-wrap justify-center gap-2 md:gap-3">
        {CARD_DECK.map((value) => {
          const isSelected = value === selectedValue;
          return (
            <li key={value}>
              <button
                type="button"
                disabled={!interactive}
                aria-pressed={interactive ? isSelected : undefined}
                onClick={() => onSelect?.(value)}
                className={cn(
                  'flex h-15 w-11 items-center justify-center rounded-lg border text-h6 font-semibold transition-colors',
                  'border-primary-purple-500 text-white shadow-card',
                  interactive && 'cursor-pointer hover:bg-primary-purple-500/30',
                  interactive && isSelected && 'bg-secondary-purple-300 text-primary-purple-700',
                  !interactive && 'cursor-not-allowed opacity-80',
                )}
              >
                {value}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
