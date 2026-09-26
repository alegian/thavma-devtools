import {useDeferredValue, useState} from 'react';
import type {GameIcon} from '../types/aspect';
import {AspectIcon} from './AspectIcon';

interface IconPickerProps {
  icons: GameIcon[];
  color: string;
  selectedIconId: string;
  onSelect: (icon: GameIcon) => void;
  onClose: () => void;
}

export function IconPicker({
  icons,
  color,
  selectedIconId,
  onSelect,
  onClose,
}: IconPickerProps) {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());
  const selectedIcon = icons.find(icon => icon.path === selectedIconId);
  const selectedIconName =
    selectedIcon?.name ||
    selectedIcon?.slug ||
    selectedIconId
      .split('/')
      .at(-1)
      ?.replace(/\.svg$/, '') ||
    selectedIconId;
  const results = icons
    .filter(icon =>
      `${icon.name} ${icon.author}`.toLowerCase().includes(deferredQuery),
    )
    .slice(0, 96);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Choose an icon"
      onMouseDown={event => event.target === event.currentTarget && onClose()}
    >
      <section className="flex max-h-[80vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-line bg-panel-strong shadow-2xl">
        <header className="flex items-center gap-3 border-b border-line p-4">
          <div className="mr-auto">
            <h2 className="font-serif text-base text-ink">Choose an icon</h2>
            <p className="text-[10px] uppercase tracking-wider text-muted">
              Game-icons.net collection
            </p>
          </div>
          <button
            type="button"
            className="rounded border border-line px-3 py-1.5 text-xs text-muted hover:text-ink"
            onClick={onClose}
          >
            Close
          </button>
        </header>
        <div className="flex items-center gap-3 border-b border-line bg-black/10 px-4 py-3">
          <div className="grid size-11 shrink-0 place-items-center rounded-md border border-line bg-black/20">
            <AspectIcon
              iconId={selectedIconId}
              color={color}
              className="size-7"
              label={selectedIconName}
            />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-faint">
              Selected icon
            </p>
            <p className="truncate text-sm capitalize text-ink">
              {selectedIconName}
            </p>
          </div>
        </div>
        <div className="border-b border-line p-4">
          <input
            autoFocus
            type="search"
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Search swords, runes, creatures..."
            className="w-full rounded-md border border-line bg-field px-3 py-2 text-sm text-ink outline-none placeholder:text-faint focus:border-amber/70"
          />
        </div>
        <div className="grid flex-1 grid-cols-4 gap-2 overflow-auto p-4 sm:grid-cols-6 md:grid-cols-8">
          {results.map(icon => (
            <button
              type="button"
              key={`${icon.author}/${icon.slug}`}
              title={`${icon.name} by ${icon.author}`}
              onClick={() => onSelect(icon)}
              className="flex min-w-0 flex-col items-center gap-2 rounded-md border border-transparent p-2 hover:border-line hover:bg-white/5"
            >
              <AspectIcon
                iconId={icon.path}
                color={color}
                className="size-10"
              />
              <span className="w-full truncate text-center text-[10px] capitalize text-muted">
                {icon.name}
              </span>
            </button>
          ))}
          {results.length === 0 && (
            <p className="col-span-full py-12 text-center text-sm text-muted">
              No matching icons.
            </p>
          )}
        </div>
        <footer className="border-t border-line px-4 py-2 text-[10px] text-faint">
          Showing {results.length} of {icons.length} icons. Icons licensed CC BY
          3.0.
        </footer>
      </section>
    </div>
  );
}
