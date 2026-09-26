import type {Aspect} from '../types/aspect';
import type {AspectGraph} from '../logic/aspectGraph';
import {aspectName} from '../logic/format';
import {AspectIcon} from './AspectIcon';

interface AspectCardProps {
  aspect: Aspect;
  graph: AspectGraph;
  selected: boolean;
  onSelect: () => void;
}

export function AspectCard({
  aspect,
  graph,
  selected,
  onSelect,
}: AspectCardProps) {
  const componentAspects = (aspect.components ?? []).map(id =>
    graph.byId.get(id),
  );
  const useCount = graph.componentUseCounts.get(aspect.id) ?? 0;
  return (
    <button
      type="button"
      onClick={onSelect}
      className="group relative w-48 shrink-0 overflow-hidden rounded-lg border border-line bg-card p-3 text-left transition-colors hover:bg-card-hover"
      style={{
        borderColor: selected ? aspect.color : undefined,
        borderTopColor: aspect.color,
        borderTopWidth: 2,
        boxShadow: selected ? `0 0 0 1px ${aspect.color}66` : undefined,
      }}
    >
      <div className="flex items-center gap-3">
        <div className="grid size-11 place-items-center rounded-md bg-black/25">
          <AspectIcon
            iconId={aspect.icon.id}
            color={aspect.color}
            className="size-8"
          />
        </div>
        <div className="min-w-0">
          <strong className="block truncate font-serif text-sm font-semibold text-ink">
            {aspectName(aspect.id)}
          </strong>
          <span className="text-[10px] uppercase tracking-wider text-muted">
            {aspect.components ? 'Compound' : 'Primal'}
          </span>
        </div>
      </div>
      {aspect.components && (
        <div className="mt-3 flex items-center gap-1.5 border-t border-line/70 pt-2 text-[10px] text-muted">
          {componentAspects.map((component, index) =>
            component ? (
              <span
                className="flex min-w-0 items-center gap-1"
                key={`${component.id}-${index}`}
              >
                <AspectIcon
                  iconId={component.icon.id}
                  color={component.color}
                  className="size-3.5"
                />
                <span className="max-w-14 truncate">
                  {aspectName(component.id)}
                </span>
                {index === 0 && <span className="text-faint">+</span>}
              </span>
            ) : (
              <span key={aspect.components?.[index]} className="text-danger">
                Missing
              </span>
            ),
          )}
        </div>
      )}
      <p className="mt-2 truncate text-[10px] text-faint">
        Opposes{' '}
        <span className="text-muted">
          {aspect.opposite ? aspectName(aspect.opposite) : 'none'}
        </span>
      </p>
      <p className="mt-2 border-t border-line/70 pt-2 text-[10px] text-faint">
        Used {useCount} {useCount === 1 ? 'time' : 'times'}
      </p>
      <p className="mt-2 truncate border-t border-line/70 pt-2 text-[10px] text-muted">
        {aspect.description || '-'}
      </p>
    </button>
  );
}
