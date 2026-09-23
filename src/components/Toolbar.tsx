import {useState} from 'react';

interface TemplateOption {
  id: string;
  name: string;
  description: string;
}

interface ToolbarProps {
  canUndo: boolean;
  canRedo: boolean;
  aspectCount: number;
  onCreate: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onImport: () => void;
  onExport: () => void;
  templates: TemplateOption[];
  onReset: (templateId: string) => void;
}

const buttonClass =
  'rounded-md border border-line bg-panel-strong px-3 py-2 text-xs font-semibold text-ink transition-colors hover:border-amber/60 hover:text-amber disabled:cursor-not-allowed disabled:opacity-35';
const iconButtonClass =
  'grid size-9 place-items-center rounded-md border border-line bg-panel-strong text-ink transition-colors hover:border-amber/60 hover:text-amber disabled:cursor-not-allowed disabled:opacity-35';
const faviconUrl = `${import.meta.env.BASE_URL}favicon.png`;

export function Toolbar({
  canUndo,
  canRedo,
  aspectCount,
  onCreate,
  onUndo,
  onRedo,
  onImport,
  onExport,
  templates,
  onReset,
}: ToolbarProps) {
  const [templateMenuOpen, setTemplateMenuOpen] = useState(false);

  return (
    <header className="flex min-h-16 flex-wrap items-center gap-2 border-b border-line bg-panel/95 px-4 py-3 lg:px-6">
      <div className="mr-auto flex min-w-56 items-center gap-3">
        <img src={faviconUrl} alt="" className="size-9 object-contain" />
        <h1 className="font-serif text-lg leading-none tracking-wide text-ink">
          Aspect Tree Editor
        </h1>
        <span className="rounded-full border border-line bg-black/15 px-2 py-1 text-[10px] font-medium text-muted">
          {aspectCount} {aspectCount === 1 ? 'aspect' : 'aspects'}
        </span>
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
      <div className="relative">
        <button
          className={`${buttonClass} flex items-center gap-2`}
          type="button"
          aria-haspopup="menu"
          aria-expanded={templateMenuOpen}
          onClick={() => setTemplateMenuOpen(open => !open)}
        >
          Templates
          <svg
            viewBox="0 0 20 20"
            className="size-3"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="m5 7 5 6 5-6H5Z" />
          </svg>
        </button>
        {templateMenuOpen && (
          <div
            className="absolute right-0 top-full z-30 mt-2 w-72 overflow-hidden rounded-md border border-line bg-panel-strong p-1 shadow-2xl"
            role="menu"
          >
            {templates.map(template => (
              <button
                type="button"
                role="menuitem"
                key={template.id}
                onClick={() => {
                  setTemplateMenuOpen(false);
                  onReset(template.id);
                }}
                className="block w-full rounded px-3 py-2 text-left hover:bg-white/5"
              >
                <span className="block text-xs font-semibold text-ink">
                  {template.name}
                </span>
                <span className="mt-0.5 block text-[10px] leading-relaxed text-muted">
                  {template.description}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
