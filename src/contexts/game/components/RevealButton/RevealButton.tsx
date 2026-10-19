import { Button } from '@/components/atoms/Button/Button';

interface RevealButtonProps {
  onReveal?: () => void;
}

// Figma (60:994): botón morado centrado en la mesa. Solo lo ve quien dirige (espectador).
// La lógica de revelar cartas es de otra HU; por ahora solo se muestra.
export function RevealButton({ onReveal }: RevealButtonProps) {
  return (
    <Button variant="primary" onClick={onReveal}>
      Revelar cartas
    </Button>
  );
}
