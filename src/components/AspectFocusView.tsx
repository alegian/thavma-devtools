import type {Aspect} from '../types/aspect';
import type {AspectGraph} from '../logic/aspectGraph';
import {aspectName} from '../logic/format';

interface AspectFocusViewProps {
  aspect: Aspect;
  graph: AspectGraph;
  onSelect: (id: string) => void;
}

export function AspectFocusView({
  aspect,
  graph,
  onSelect,
}: AspectFocusViewProps) {
  const components = (aspect.components ?? []).map(id => graph.byId.get(id));
  const dependents = (graph.dependents.get(aspect.id) ?? [])
    .slice(0, 3)
    .map(id => graph.byId.get(id))
    .filter(Boolean) as Aspect[];
  if (components.length === 0 && dependents.length === 0)
    return (
      <div className="rounded-md border border-line bg-black/15 p-4 text-center text-xs text-muted">
        No local dependencies
      </div>
    );

  return (
    <svg
      viewBox="0 0 360 170"
      className="w-full rounded-md border border-line bg-black/15"
      role="img"
      aria-label={`Focused dependencies for ${aspectName(aspect.id)}`}
    >
      <g fill="none" stroke="#4a4945" strokeWidth="1.5">
        {components[0] && <path d="M84 45 H125 Q140 45 140 60 V82 H167" />}
        {components[1] && <path d="M84 125 H125 Q140 125 140 110 V88 H167" />}
        {dependents.map((_, index) => (
          <path
            key={index}
            d={`M233 85 H260 Q272 85 272 ${45 + index * 40} H292`}
          />
        ))}
      </g>
      {components.map(
        (component, index) =>
          component && (
            <g
              key={component.id}
              role="button"
              tabIndex={0}
              className="cursor-pointer"
              onClick={() => onSelect(component.id)}
              onKeyDown={event =>
                event.key === 'Enter' && onSelect(component.id)
              }
            >
              <circle
                cx="58"
                cy={45 + index * 80}
                r="25"
                fill="#181817"
                stroke={component.color}
                strokeWidth="2"
              />
              <text
                x="58"
                y={49 + index * 80}
                fill="#d4d0c7"
                fontSize="10"
                textAnchor="middle"
              >
                {aspectName(component.id).slice(0, 10)}
              </text>
            </g>
          ),
      )}
      <rect
        x="167"
        y="62"
        width="66"
        height="46"
        rx="8"
        fill="#22211f"
        stroke={aspect.color}
        strokeWidth="2"
      />
      <text
        x="200"
        y="89"
        fill="#f1eee5"
        fontSize="11"
        fontWeight="600"
        textAnchor="middle"
      >
        {aspectName(aspect.id).slice(0, 11)}
      </text>
      {dependents.map((dependent, index) => (
        <g
          key={dependent.id}
          role="button"
          tabIndex={0}
          className="cursor-pointer"
          onClick={() => onSelect(dependent.id)}
          onKeyDown={event => event.key === 'Enter' && onSelect(dependent.id)}
        >
          <circle
            cx="316"
            cy={45 + index * 40}
            r="20"
            fill="#181817"
            stroke={dependent.color}
          />
          <text
            x="316"
            y={48 + index * 40}
            fill="#aaa69d"
            fontSize="8"
            textAnchor="middle"
          >
            {aspectName(dependent.id).slice(0, 9)}
          </text>
        </g>
      ))}
    </svg>
  );
}
