// Figma (60:1035): spinner de puntos con el texto "Contando votos" en el centro de la mesa.
export function CountingVotes() {
  return (
    <div className="flex flex-col items-center gap-3" role="status" aria-live="polite">
      <div className="flex items-center gap-2">
        {[0, 1, 2].map((dot) => (
          <span
            key={dot}
            className="size-3 animate-pulse rounded-full border-2 border-secondary-purple-300"
            style={{ animationDelay: `${dot * 150}ms` }}
          />
        ))}
      </div>
      <p className="text-p3 text-white">Contando votos</p>
    </div>
  );
}
