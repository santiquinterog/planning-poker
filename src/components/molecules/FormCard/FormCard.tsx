import type { ReactNode } from 'react';

interface FormCardProps {
  children: ReactNode;
}

// Figma: tarjeta centrada con borde y glow morado sobre el fondo de la mesa.
// Inferencia mobile: ancho completo con padding reducido; el glow se mantiene.
export function FormCard({ children }: FormCardProps) {
  return (
    <div className="w-full max-w-md rounded-3xl border border-secondary-purple-300/60 bg-surface-900/40 p-6 shadow-glow-03 md:p-10">
      {children}
    </div>
  );
}
