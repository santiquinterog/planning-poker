import type { ReactNode } from 'react';

interface PokerTableProps {
  seat?: ReactNode;
}

// Figma (frame 60:861): tres rectángulos redondeados anidados con radio 276 sobre altura 345 ->
// forma de "estadio" (lados rectos, extremos semicirculares), no una elipse.
//   Externo 603x345 r276 con glow (shadow-ring)
//   Medio   555x298 con shadow-glow-03
//   Interno 521x272 con fondo translúcido
// La mesa ocupa un ancho amplio (hasta ~760px) para acercarse a la presencia del diseño.
// Inferencia mobile: escala con el ancho conservando la proporción 603/345.
export function PokerTable({ seat }: PokerTableProps) {
  return (
    <div className="flex w-full flex-col items-center gap-6">
      <div className="relative aspect-[603/345] w-full max-w-[760px]">
        <div className="absolute inset-0 rounded-[215px] border-2 border-primary-purple-500 shadow-ring" />
        <div className="absolute inset-[4%_4%] rounded-[215px] border-2 border-primary-purple-500 shadow-glow-03" />
        <div className="absolute inset-[9.5%_7.5%] rounded-[215px] border border-primary-purple-500 bg-surface-900/40 shadow-100" />
      </div>
      {seat}
    </div>
  );
}
