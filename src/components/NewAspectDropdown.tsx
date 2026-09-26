import {useEffect, useMemo, useRef, useState} from 'react';
import type {AspectTemplate} from '../data/aspectTemplates';
import {AspectDropdown, type AspectDropdownOption} from './AspectDropdown';

interface NewAspectDropdownProps {
  templates: AspectTemplate[];
  onCreate: () => void;
  onCopy: (templateId: string, aspectId: string) => void;
}

const triggerClass =
  'flex items-center gap-2 rounded-md border border-line bg-panel-strong px-3 py-2 text-xs font-semibold text-ink transition-colors hover:border-amber/60 hover:text-amber';
const menuItemClass =
  'flex w-full items-center justify-between gap-3 rounded px-3 py-2 text-left text-xs font-semibold text-ink hover:bg-white/5';

export function NewAspectDropdown({
  templates,
  onCreate,
  onCopy,
}: NewAspectDropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const sources = useMemo(
    () =>
      templates.flatMap(template =>
        template.create().map((aspect, index) => ({
          templateId: template.id,
          aspectId: aspect.id,
          option: {
            value: `${template.id}:${index}`,
            aspect,
            subtitle: template.name,
          } satisfies AspectDropdownOption,
        })),
      ),
    [templates],
  );

  useEffect(() => {
    if (!open) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', closeOnOutsideClick);
    return () =>
      document.removeEventListener('pointerdown', closeOnOutsideClick);
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        className={triggerClass}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(current => !current)}
      >
        New aspect
        <svg
          viewBox="0 0 20 20"
          className="size-3"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="m5 7 5 6 5-6H5Z" />
        </svg>
      </button>
      {open && (
        <div
          className="absolute left-0 top-full z-30 mt-2 w-56 rounded-md border border-line bg-panel-strong p-1 shadow-2xl"
          role="menu"
        >
          <button
            type="button"
            role="menuitem"
            className={menuItemClass}
            onClick={() => {
              setOpen(false);
              onCreate();
            }}
          >
            Add dummy
          </button>
          <AspectDropdown
            options={sources.map(source => source.option)}
            value={null}
            onSelect={value => {
              const source = sources.find(
                candidate => candidate.option.value === value,
              );
              if (!source) return;
              setOpen(false);
              onCopy(source.templateId, source.aspectId);
            }}
            className="static"
            triggerClassName={menuItemClass}
            menuClassName="left-0 w-80"
            trigger={<span>Copy an aspect</span>}
          />
        </div>
      )}
    </div>
  );
}
