import { formatAverage, type VoteResults } from '@/contexts/game/domain/vote-results';

interface VoteSummaryProps {
  results: VoteResults;
}

// Figma (60:1346): distribución de votos por valor y el promedio a la derecha.
export function VoteSummary({ results }: VoteSummaryProps) {
  return (
    <div className="flex w-full max-w-4xl flex-wrap items-center justify-center gap-8 md:gap-20">
      <ul className="flex flex-wrap justify-center gap-3">
        {results.tallies.map((tally) => (
          <li key={tally.value} className="flex flex-col items-center gap-2">
            <div className="flex h-15 w-11 items-center justify-center rounded-lg border border-primary-purple-500 text-h6 font-bold text-white shadow-card">
              {tally.value}
            </div>
            <span className="text-p3 text-white">
              {tally.count} {tally.count === 1 ? 'Voto' : 'Votos'}
            </span>
          </li>
        ))}
      </ul>
      <div className="flex flex-col items-center gap-1">
        <span className="text-p3 text-white">Promedio:</span>
        <span className="text-title font-bold text-white">{formatAverage(results.average)}</span>
      </div>
    </div>
  );
}
