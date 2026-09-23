import {useEffect, useMemo, useRef, useState} from 'react';
import {AspectBoard} from './components/AspectBoard';
import {AspectInspector} from './components/AspectInspector';
import {Toolbar} from './components/Toolbar';
import {ValidationPanel} from './components/ValidationPanel';
import {freshSampleAspects} from './data/sampleAspects';
import {useAspectHistory} from './hooks/useAspectHistory';
import {buildAspectGraph} from './logic/aspectGraph';
import {downloadAspectJson, parseAspectJson} from './logic/importExport';
import {validateAspects} from './logic/validation';
import type {Aspect, GameIcon, ValidationProblem} from './types/aspect';

const storageKey = 'aspectarium.dataset.v1';
const assetRoot = `${import.meta.env.BASE_URL}game-icons/`;

function loadInitialAspects() {
  const saved = localStorage.getItem(storageKey);
  if (!saved) return freshSampleAspects();
  const parsed = parseAspectJson(saved, true);
  return parsed.data ?? freshSampleAspects();
}

function App() {
  const history = useAspectHistory<Aspect[]>(loadInitialAspects());
  const [selectedId, setSelectedId] = useState<string | null>('motus');
  const [icons, setIcons] = useState<GameIcon[]>([]);
  const [importProblems, setImportProblems] = useState<ValidationProblem[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);
  const graph = useMemo(() => buildAspectGraph(history.value), [history.value]);
  const problems = useMemo(
    () => [...importProblems, ...validateAspects(history.value)],
    [history.value, importProblems],
  );
  const selectedAspect = selectedId
    ? (graph.byId.get(selectedId) ?? null)
    : null;

  useEffect(
    () => localStorage.setItem(storageKey, JSON.stringify(history.value)),
    [history.value],
  );

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${assetRoot}manifest.json`, {signal: controller.signal})
      .then(response => response.json() as Promise<{icons: GameIcon[]}>)
      .then(manifest => setIcons(manifest.icons))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError')
          return;
        setImportProblems([
          {
            message: 'The game icon manifest could not be loaded.',
            severity: 'warning',
          },
        ]);
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 'z')
        return;
      event.preventDefault();
      if (event.shiftKey) history.redo();
      else history.undo();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [history]);

  const updateSelected = (patch: Partial<Aspect>) => {
    if (!selectedId) return;
    history.set(current => {
      const selected = current.find(aspect => aspect.id === selectedId);
      if (!selected) return current;
      let next = current.map(aspect =>
        aspect.id === selectedId ? {...aspect, ...patch} : aspect,
      );
      if (!Object.hasOwn(patch, 'opposite')) return next;

      if (selected.opposite && selected.opposite !== patch.opposite) {
        next = next.map(aspect =>
          aspect.id === selected.opposite && aspect.opposite === selectedId
            ? {...aspect, opposite: null}
            : aspect,
        );
      }
      if (patch.opposite) {
        const target = next.find(aspect => aspect.id === patch.opposite);
        if (target && (!target.opposite || target.opposite === selectedId)) {
          next = next.map(aspect =>
            aspect.id === target.id
              ? {...aspect, opposite: selectedId}
              : aspect,
          );
        }
      }
      return next;
    });
  };

  const renameSelected = (nextId: string) => {
    if (!selectedId || nextId === selectedId) return true;
    if (history.value.some(aspect => aspect.id === nextId)) return false;
    const previousId = selectedId;
    history.set(current =>
      current.map(aspect => ({
        ...aspect,
        id: aspect.id === previousId ? nextId : aspect.id,
        components: aspect.components?.map(component =>
          component === previousId ? nextId : component,
        ) as [string, string] | null,
        opposite: aspect.opposite === previousId ? nextId : aspect.opposite,
      })),
    );
    setSelectedId(nextId);
    return true;
  };

  const importFile = async (file: File) => {
    const parsed = parseAspectJson(await file.text());
    setImportProblems(parsed.problems);
    if (!parsed.data) return;
    history.set(parsed.data);
    setSelectedId(parsed.data[0]?.id ?? null);
    setImportProblems([]);
  };

  const createAspect = () => {
    const baseId = 'new-aspect';
    let nextId = baseId;
    let suffix = 2;
    while (graph.byId.has(nextId)) {
      nextId = `${baseId}-${suffix}`;
      suffix += 1;
    }
    const aspect: Aspect = {
      id: nextId,
      color: '#d9a94a',
      icon: {id: 'svg/lorc/crystal-growth.svg'},
      components: null,
      opposite: null,
    };
    history.set(current => [...current, aspect]);
    setSelectedId(nextId);
  };

  const deleteSelected = () => {
    if (!selectedAspect) return;
    const directDependents = graph.dependents.get(selectedAspect.id) ?? [];
    const oppositeReferences = history.value
      .filter(aspect => aspect.opposite === selectedAspect.id)
      .map(aspect => aspect.id);
    const affected = [...new Set([...directDependents, ...oppositeReferences])];
    const warning = affected.length
      ? `\n\nReferences from ${affected.join(', ')} will be left in place and reported in Problems.`
      : '';
    if (
      !window.confirm(
        `Delete ${selectedAspect.id}?${warning}\n\nThis can be undone.`,
      )
    )
      return;

    const deletedId = selectedAspect.id;
    const remaining = history.value.filter(aspect => aspect.id !== deletedId);
    history.set(remaining);
    setSelectedId(remaining[0]?.id ?? null);
  };

  const reset = () => {
    if (
      !window.confirm(
        'Replace the current dataset with sample aspects? This can be undone.',
      )
    )
      return;
    history.set(freshSampleAspects());
    setSelectedId('motus');
    setImportProblems([]);
  };

  return (
    <main className="flex min-h-screen flex-col bg-canvas text-ink xl:h-dvh xl:min-h-[42rem] xl:overflow-hidden">
      <Toolbar
        canUndo={history.canUndo}
        canRedo={history.canRedo}
        onCreate={createAspect}
        onUndo={history.undo}
        onRedo={history.redo}
        onImport={() => fileInput.current?.click()}
        onExport={() => downloadAspectJson(history.value)}
        onReset={reset}
      />
      <input
        ref={fileInput}
        hidden
        type="file"
        accept="application/json,.json"
        onChange={event => {
          const file = event.target.files?.[0];
          if (file) void importFile(file);
          event.currentTarget.value = '';
        }}
      />
      <div className="grid flex-1 grid-cols-1 xl:min-h-0 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="flex min-h-[28rem] flex-col xl:min-h-0">
          <AspectBoard
            aspects={history.value}
            graph={graph}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
          <ValidationPanel problems={problems} onSelect={setSelectedId} />
        </div>
        <AspectInspector
          aspect={selectedAspect}
          aspects={history.value}
          graph={graph}
          icons={icons}
          onUpdate={updateSelected}
          onRename={renameSelected}
          onDelete={deleteSelected}
          onSelect={setSelectedId}
        />
      </div>
    </main>
  );
}

export default App;
