import {useState} from 'react';
import {HexColorPicker} from 'react-colorful';
import {
  getAncestors,
  getDependents,
  type AspectGraph,
} from '../logic/aspectGraph';
import type {Aspect, GameIcon} from '../types/aspect';
import {aspectName} from '../logic/format';
import {AspectDropdown} from './AspectDropdown';
import {AspectIcon} from './AspectIcon';
import {IconPicker} from './IconPicker';

interface AspectInspectorProps {
  aspect: Aspect | null;
  aspects: Aspect[];
  graph: AspectGraph;
  icons: GameIcon[];
  onUpdate: (patch: Partial<Aspect>) => void;
  onRename: (id: string) => boolean;
  onDelete: () => void;
  onSelect: (id: string) => void;
}

const inputClass =
  'w-full rounded-md border border-line bg-field px-3 py-2 text-sm text-ink outline-none focus:border-amber/70';

export function AspectInspector({
  aspect,
  aspects,
  graph,
  icons,
  onUpdate,
  onRename,
  onDelete,
  onSelect,
}: AspectInspectorProps) {
  const [nameDraft, setNameDraft] = useState({aspectId: '', value: ''});
  const [pickerOpen, setPickerOpen] = useState(false);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [nameError, setNameError] = useState({aspectId: '', message: ''});

  if (!aspect)
    return (
      <aside className="grid min-h-72 place-items-center border-l border-line bg-panel p-8 text-center">
        <div>
          <p className="font-serif text-base text-ink">No aspect selected</p>
          <p className="mt-2 max-w-52 text-xs leading-relaxed text-muted">
            Choose a card to inspect its composition and edit its properties.
          </p>
        </div>
      </aside>
    );

  const componentCandidates = aspects.filter(
    candidate => candidate.id !== aspect.id,
  );
  const components = aspect.components;
  const ancestors = getAncestors(aspect.id, graph);
  const dependents = getDependents(aspect.id, graph);
  const opposite = aspect.opposite ? graph.byId.get(aspect.opposite) : null;
  const displayedName =
    nameDraft.aspectId === aspect.id ? nameDraft.value : aspectName(aspect.id);
  const displayedError =
    nameError.aspectId === aspect.id ? nameError.message : '';
  const commitName = () => {
    const id = displayedName
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    if (!id)
      return setNameError({
        aspectId: aspect.id,
        message: 'Name must contain letters or numbers.',
      });
    if (!onRename(id))
      return setNameError({
        aspectId: aspect.id,
        message: 'That aspect name is already in use.',
      });
    setNameError({aspectId: id, message: ''});
  };
  const toggleCompound = () => {
    if (aspect.components) return onUpdate({components: null});
    const first = componentCandidates[0]?.id;
    const second = componentCandidates[1]?.id ?? first;
    if (first && second) onUpdate({components: [first, second]});
  };

  return (
    <aside className="min-w-0 overflow-y-auto border-l border-line bg-panel">
      <div className="border-b border-line p-5">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="grid size-16 shrink-0 place-items-center rounded-lg border border-line bg-black/25 hover:border-amber/60"
            title="Change icon"
          >
            <AspectIcon
              iconId={aspect.icon.id}
              color={aspect.color}
              className="size-11"
            />
          </button>
          <AspectDropdown
            aspects={aspects}
            value={aspect.id}
            excludeValue
            onSelect={id => id && onSelect(id)}
            className="min-w-0 flex-1"
            triggerClassName="flex w-full min-w-0 items-center gap-3 text-left"
            menuClassName="right-0 w-[calc(100%+5rem)]"
            trigger={
              <div className="min-w-0 flex-1">
                <h2 className="truncate font-serif text-xl text-ink">
                  {aspectName(aspect.id)}
                </h2>
                <p className="mt-1 text-xs text-muted">
                  Depth {graph.depths.get(aspect.id) ?? 'unresolved'}
                </p>
              </div>
            }
          />
        </div>
      </div>

      <div className="space-y-4 p-5">
        <label className="block text-[10px] font-semibold uppercase tracking-wider text-muted">
          Name
          <input
            className={`${inputClass} mt-1.5`}
            value={displayedName}
            onChange={event =>
              setNameDraft({aspectId: aspect.id, value: event.target.value})
            }
            onBlur={commitName}
            onKeyDown={event =>
              event.key === 'Enter' && event.currentTarget.blur()
            }
          />
          {displayedError && (
            <span className="mt-1 block normal-case tracking-normal text-danger">
              {displayedError}
            </span>
          )}
        </label>

        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-muted">
            Color
          </label>
          <div className="mt-1.5 grid grid-cols-[2.5rem_1fr] gap-2">
            <button
              type="button"
              aria-label="Choose color"
              aria-expanded={colorPickerOpen}
              onClick={() => setColorPickerOpen(open => !open)}
              className="rounded-md border border-line bg-field p-1"
            >
              <span
                className="block size-full rounded-sm"
                style={{
                  backgroundColor: /^#[0-9a-f]{6}$/i.test(aspect.color)
                    ? aspect.color
                    : '#ffffff',
                }}
              />
            </button>
            <input
              className={`${inputClass} font-mono`}
              value={aspect.color}
              onChange={event => onUpdate({color: event.target.value})}
            />
          </div>
          {colorPickerOpen && (
            <div className="mt-2 max-w-full overflow-hidden rounded-md border border-line bg-field p-2">
              <HexColorPicker
                className="!h-40 !w-full"
                color={
                  /^#[0-9a-f]{6}$/i.test(aspect.color)
                    ? aspect.color
                    : '#ffffff'
                }
                onChange={color => onUpdate({color})}
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between rounded-md border border-line bg-black/15 p-3">
          <div>
            <p className="text-xs font-semibold text-ink">Compound aspect</p>
            <p className="mt-0.5 text-[10px] text-muted">
              Depth is derived from ingredients
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={aspect.components !== null}
            onClick={toggleCompound}
            className={`relative h-6 w-11 rounded-full border transition-colors ${aspect.components ? 'border-amber/70 bg-amber/30' : 'border-line bg-field'}`}
          >
            <span
              className={`absolute top-1 size-3.5 rounded-full bg-ink transition-all ${aspect.components ? 'left-6' : 'left-1'}`}
            />
          </button>
        </div>

        {components && (
          <div className="grid grid-cols-2 gap-3">
            {([0, 1] as const).map(index => (
              <div
                key={index}
                className="block text-[10px] font-semibold uppercase tracking-wider text-muted"
              >
                <span>Ingredient {index + 1}</span>
                <AspectDropdown
                  aspects={componentCandidates}
                  value={components[index]}
                  selfId={aspect.id}
                  onSelect={id => {
                    if (!id) return;
                    const nextComponents: [string, string] = [...components];
                    nextComponents[index] = id;
                    onUpdate({components: nextComponents});
                  }}
                  className="mt-1.5"
                  triggerClassName={`${inputClass} flex items-center justify-between gap-2 text-left normal-case tracking-normal`}
                  menuClassName={`${index === 0 ? 'left-0' : 'right-0'} w-64`}
                  trigger={
                    <span className="min-w-0 flex-1 truncate">
                      {aspectName(components[index])}
                    </span>
                  }
                />
              </div>
            ))}
          </div>
        )}

        <div className="block text-[10px] font-semibold uppercase tracking-wider text-muted">
          <span>Opposite</span>
          <AspectDropdown
            aspects={aspects}
            value={aspect.opposite}
            selfId={aspect.id}
            allowNone
            onSelect={id => onUpdate({opposite: id})}
            className="mt-1.5"
            triggerClassName={`${inputClass} flex items-center justify-between gap-2 text-left normal-case tracking-normal`}
            trigger={
              <span className="min-w-0 flex-1 truncate">
                {aspect.opposite ? aspectName(aspect.opposite) : 'None'}
              </span>
            }
          />
        </div>
      </div>

      <div className="space-y-5 border-t border-line p-5">
        <RelationList
          title="Components"
          aspects={(aspect.components ?? []).flatMap(
            id => graph.byId.get(id) ?? [],
          )}
          empty="This aspect is primal."
          onSelect={onSelect}
        />
        <RelationList
          title="Opposite"
          aspects={opposite ? [opposite] : []}
          empty="No opposite assigned."
          onSelect={onSelect}
        />
        <RelationList
          title="Ancestors"
          aspects={ancestors}
          empty="Primal aspects have no ancestors."
          onSelect={onSelect}
        />
        <RelationList
          title="Dependents"
          aspects={dependents}
          empty="No aspects depend on this one."
          onSelect={onSelect}
        />
      </div>
      <div className="border-t border-line p-5">
        <button
          type="button"
          onClick={onDelete}
          className="w-full rounded-md border border-danger/40 bg-danger/5 px-3 py-2 text-xs font-semibold text-danger transition-colors hover:border-danger hover:bg-danger/10"
        >
          Delete {aspectName(aspect.id)}
        </button>
      </div>
      {pickerOpen && (
        <IconPicker
          icons={icons}
          color={aspect.color}
          selectedIconId={aspect.icon.id}
          onClose={() => setPickerOpen(false)}
          onSelect={icon => {
            onUpdate({icon: {id: icon.path}});
            setPickerOpen(false);
          }}
        />
      )}
    </aside>
  );
}

function RelationList({
  title,
  aspects,
  empty,
  onSelect,
}: {
  title: string;
  aspects: Aspect[];
  empty: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div>
      <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted">
        {title}
      </h3>
      {aspects.length ? (
        <div className="flex flex-wrap gap-2">
          {aspects.map(item => (
            <button
              type="button"
              key={item.id}
              onClick={() => onSelect(item.id)}
              className="flex items-center gap-1.5 rounded border border-line bg-black/15 px-2 py-1 text-[11px] text-ink hover:border-muted hover:bg-white/5"
            >
              <AspectIcon
                iconId={item.icon.id}
                color={item.color}
                className="size-3.5"
              />
              {aspectName(item.id)}
            </button>
          ))}
        </div>
      ) : (
        <p className="text-xs text-faint">{empty}</p>
      )}
    </div>
  );
}
