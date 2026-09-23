import {useState} from 'react';

interface History<T> {
  past: T[];
  present: T;
  future: T[];
}

export function useAspectHistory<T>(initialValue: T) {
  const [history, setHistory] = useState<History<T>>({
    past: [],
    present: initialValue,
    future: [],
  });

  const set = (next: T | ((current: T) => T)) => {
    setHistory(current => {
      const present =
        typeof next === 'function'
          ? (next as (value: T) => T)(current.present)
          : next;
      if (Object.is(present, current.present)) return current;
      return {past: [...current.past, current.present], present, future: []};
    });
  };
  const undo = () =>
    setHistory(current => {
      const present = current.past.at(-1);
      return present === undefined
        ? current
        : {
            past: current.past.slice(0, -1),
            present,
            future: [current.present, ...current.future],
          };
    });
  const redo = () =>
    setHistory(current => {
      const [present, ...future] = current.future;
      return present === undefined
        ? current
        : {past: [...current.past, current.present], present, future};
    });

  return {
    value: history.present,
    set,
    undo,
    redo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
  };
}
