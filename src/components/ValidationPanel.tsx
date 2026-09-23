import type {ValidationProblem} from '../types/aspect';

interface ValidationPanelProps {
  problems: ValidationProblem[];
  onSelect: (id: string) => void;
}

export function ValidationPanel({problems, onSelect}: ValidationPanelProps) {
  const errors = problems.filter(
    problem => problem.severity === 'error',
  ).length;
  return (
    <section className="border-t border-line bg-panel px-4 py-3">
      <details open={problems.length > 0}>
        <summary className="cursor-pointer list-none text-xs font-semibold text-ink">
          Problems{' '}
          <span
            className={`ml-2 rounded-full px-2 py-0.5 text-[10px] ${problems.length ? 'bg-danger/15 text-danger' : 'bg-success/15 text-success'}`}
          >
            {problems.length || 'None'}
          </span>
          {errors > 0 && (
            <span className="ml-2 text-[10px] font-normal text-muted">
              {errors} error{errors === 1 ? '' : 's'}
            </span>
          )}
        </summary>
        {problems.length > 0 && (
          <div className="mt-3 max-h-28 space-y-1 overflow-auto">
            {problems.map((problem, index) => (
              <button
                key={`${problem.aspectId}-${problem.message}-${index}`}
                type="button"
                onClick={() => problem.aspectId && onSelect(problem.aspectId)}
                className="block w-full rounded px-2 py-1 text-left text-[11px] text-muted hover:bg-white/5"
              >
                <span
                  className={
                    problem.severity === 'error' ? 'text-danger' : 'text-amber'
                  }
                >
                  {problem.severity.toUpperCase()}
                </span>
                {problem.aspectId && (
                  <span className="mx-2 font-semibold text-ink">
                    {problem.aspectId}
                  </span>
                )}
                {problem.message}
              </button>
            ))}
          </div>
        )}
      </details>
    </section>
  );
}
