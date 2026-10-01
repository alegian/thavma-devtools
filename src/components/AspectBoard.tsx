import {groupAspectsByDepth, type AspectGraph} from '../logic/aspectGraph';
import type {Aspect} from '../types/aspect';
import {AspectRow} from './AspectRow';

interface AspectBoardProps {
  aspects: Aspect[];
  graph: AspectGraph;
  selectedId: string | null;
  onSelect: (id: string) => void;
  calculatedOpposites: boolean;
}

export function AspectBoard({
  aspects,
  graph,
  selectedId,
  onSelect,
  calculatedOpposites,
}: AspectBoardProps) {
  const groups = groupAspectsByDepth(aspects, graph);
  const depths = [...groups.keys()].sort((a, b) =>
    a === null ? 1 : b === null ? -1 : a - b,
  );
  return (
    <div className="min-h-0 min-w-0 flex-1 overflow-auto bg-board">
      {depths.map(depth => (
        <AspectRow
          key={depth ?? 'invalid'}
          depth={depth}
          aspects={groups.get(depth) ?? []}
          graph={graph}
          selectedId={selectedId}
          onSelect={onSelect}
          calculatedOpposites={calculatedOpposites}
        />
      ))}
    </div>
  );
}
