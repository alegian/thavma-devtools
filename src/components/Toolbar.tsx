interface ToolbarProps {
  canUndo: boolean;
  canRedo: boolean;
  onCreate: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onImport: () => void;
  onExport: () => void;
  onReset: () => void;
}

const buttonClass =
  'rounded-md border border-line bg-panel-strong px-3 py-2 text-xs font-semibold text-ink transition-colors hover:border-amber/60 hover:text-amber disabled:cursor-not-allowed disabled:opacity-35';
const iconButtonClass =
  'grid size-9 place-items-center rounded-md border border-line bg-panel-strong text-ink transition-colors hover:border-amber/60 hover:text-amber disabled:cursor-not-allowed disabled:opacity-35';
const faviconUrl = `${import.meta.env.BASE_URL}favicon.png`;

export function Toolbar({
  canUndo,
  canRedo,
  onCreate,
  onUndo,
  onRedo,
  onImport,
  onExport,
  onReset,
}: ToolbarProps) {
  return (
    <header className="flex min-h-16 flex-wrap items-center gap-2 border-b border-line bg-panel/95 px-4 py-3 lg:px-6">
      <div className="mr-auto flex min-w-56 items-center gap-3">
        <img src={faviconUrl} alt="" className="size-9 object-contain" />
        <h1 className="font-serif text-lg leading-none tracking-wide text-ink">
          Aspect Tree Editor
        </h1>
      </div>
      <button className={buttonClass} onClick={onCreate}>
        New aspect
      </button>
      <span className="mx-1 hidden h-6 w-px bg-line sm:block" />
      <button
        className={iconButtonClass}
        onClick={onUndo}
        disabled={!canUndo}
        title="Undo"
        aria-label="Undo"
      >
        <svg
          viewBox="0 0 24 24"
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M9 7 4 12l5 5" />
          <path d="M4 12h9a7 7 0 0 1 7 7" />
        </svg>
      </button>
      <button
        className={iconButtonClass}
        onClick={onRedo}
        disabled={!canRedo}
        title="Redo"
        aria-label="Redo"
      >
        <svg
          viewBox="0 0 24 24"
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m15 7 5 5-5 5" />
          <path d="M20 12h-9a7 7 0 0 0-7 7" />
        </svg>
      </button>
      <span className="mx-1 hidden h-6 w-px bg-line sm:block" />
      <button className={buttonClass} onClick={onImport}>
        Import JSON
      </button>
      <button className={buttonClass} onClick={onExport}>
        Export JSON
      </button>
      <button className={buttonClass} onClick={onReset}>
        Reset sample data
      </button>
    </header>
  );
}
