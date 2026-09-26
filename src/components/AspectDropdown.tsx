import {useEffect, useRef, useState, type ReactNode} from 'react';
import type {Aspect} from '../types/aspect';
import {aspectName} from '../logic/format';
import {AspectIcon} from './AspectIcon';

interface AspectDropdownProps {
  aspects: Aspect[];
  value: string | null;
  trigger: ReactNode;
  onSelect: (id: string | null) => void;
  allowNone?: boolean;
  excludeValue?: boolean;
  selfId?: string;
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
}

export function AspectDropdown({
  aspects,
  value,
  trigger,
  onSelect,
  allowNone = false,
  excludeValue = false,
  selfId,
  className = '',
  triggerClassName = '',
  menuClassName = 'inset-x-0',
}: AspectDropdownProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const normalizedQuery = query.trim().toLowerCase();
  const options = aspects.filter(
    aspect =>
      (!excludeValue || aspect.id !== value) &&
      `${aspectName(aspect.id)} ${aspect.id}`
        .toLowerCase()
        .includes(normalizedQuery),
  );
  const showNone = allowNone && 'none'.includes(normalizedQuery);

  useEffect(() => {
    if (!open) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', closeOnOutsideClick);
    return () =>
      document.removeEventListener('pointerdown', closeOnOutsideClick);
  }, [open]);

  const select = (id: string | null) => {
    onSelect(id);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => {
          setQuery('');
          setOpen(current => !current);
        }}
        className={triggerClassName}
      >
        {trigger}
        <svg
          viewBox="0 0 16 16"
          aria-hidden="true"
          className={`size-4 shrink-0 text-muted transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <path
            d="m4 6 4 4 4-4"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
        </svg>
      </button>
      {open && (
        <div
          className={`absolute top-full z-30 mt-2 overflow-hidden rounded-lg border border-line bg-panel-strong shadow-2xl ${menuClassName}`}
        >
          <div className="border-b border-line p-2">
            <input
              autoFocus
              type="search"
              value={query}
              onChange={event => setQuery(event.target.value)}
              onKeyDown={event => {
                if (event.key === 'Escape') setOpen(false);
              }}
              placeholder="Search aspects..."
              className="w-full rounded-md border border-line bg-field px-3 py-2 text-sm text-ink outline-none placeholder:text-faint focus:border-amber/70"
            />
          </div>
          <div className="max-h-64 overflow-y-auto p-1" role="listbox">
            {showNone && (
              <button
                type="button"
                role="option"
                aria-selected={value === null}
                onClick={() => select(null)}
                className="flex w-full items-center rounded-md px-3 py-2 text-left text-sm text-muted hover:bg-white/5"
              >
                None
              </button>
            )}
            {options.map(aspect => (
              <button
                type="button"
                role="option"
                aria-selected={aspect.id === value}
                key={aspect.id}
                onClick={() => select(aspect.id)}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left hover:bg-white/5"
              >
                <AspectIcon
                  iconId={aspect.icon.id}
                  color={aspect.color}
                  className="size-5"
                />
                <span className="min-w-0 flex-1 truncate text-sm text-ink">
                  {aspectName(aspect.id)}
                  {aspect.id === selfId ? ' (self)' : ''}
                </span>
              </button>
            ))}
            {!showNone && options.length === 0 && (
              <p className="px-3 py-6 text-center text-xs text-muted">
                No matching aspects.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
