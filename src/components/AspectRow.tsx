import type {Aspect} from '../types/aspect';
import type {AspectGraph} from '../logic/aspectGraph';
import {AspectCard} from './AspectCard';

interface AspectRowProps {
  depth: number | null;
  aspects: Aspect[];
  graph: AspectGraph;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function AspectRow({
  depth,
  aspects,
  graph,
  selectedId,
  onSelect,
}: AspectRowProps) {
  const label =
    depth === null ? 'Unresolved' : depth === 0 ? 'Primal' : `Depth ${depth}`;
  return (
    <section className="grid min-w-max grid-cols-[7.5rem_1fr] border-b border-line/70 last:border-b-0">
      <div className="border-r border-line/70 bg-panel/60 px-4 py-5">
        <p
          className={`font-serif text-sm ${depth === null ? 'text-danger' : 'text-ink'}`}
        >
          {label}
        </p>
        <p className="mt-1 text-[10px] uppercase tracking-wider text-faint">
          {aspects.length} aspect{aspects.length === 1 ? '' : 's'}
        </p>
      </div>
      <div className="flex min-h-36 gap-3 p-4">
        {aspects.map(aspect => (
          <AspectCard
            key={aspect.id}
            aspect={aspect}
            graph={graph}
            selected={selectedId === aspect.id}
            onSelect={() => onSelect(aspect.id)}
          />
        ))}
      </div>
    </section>
  );
}
