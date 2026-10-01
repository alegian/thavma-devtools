import type {Aspect, AspectId, ValidationProblem} from '../types/aspect';
import type {AspectGraph} from './aspectGraph';

export function getCalculatedOpposite(
  aspect: Aspect,
  graph: AspectGraph,
): Aspect | null {
  const resolved = new Map<AspectId, Aspect | null>();

  const resolve = (current: Aspect, visiting: Set<AspectId>): Aspect | null => {
    if (resolved.has(current.id)) return resolved.get(current.id) ?? null;
    if (visiting.has(current.id)) {
      throw new Error(`Circular components encountered at ${current.id}.`);
    }

    if (!current.components) {
      if (!current.opposite) {
        resolved.set(current.id, null);
        return null;
      }
      const opposite = graph.byId.get(current.opposite);
      if (!opposite) {
        throw new Error(
          `Primal ${current.id} references missing opposite ${current.opposite}.`,
        );
      }
      resolved.set(current.id, opposite);
      return opposite;
    }

    const nextVisiting = new Set(visiting).add(current.id);
    const oppositeComponents = current.components.map(componentId => {
      const component = graph.byId.get(componentId);
      if (!component) {
        throw new Error(
          `${current.id} references missing component ${componentId}.`,
        );
      }
      const opposite = resolve(component, nextVisiting);
      if (!opposite) {
        throw new Error(`Component ${componentId} has no calculated opposite.`);
      }
      return opposite.id;
    }) as [AspectId, AspectId];

    const opposite = [...graph.byId.values()].find(candidate => {
      if (!candidate.components) return false;
      const [first, second] = candidate.components;
      const [oppositeFirst, oppositeSecond] = oppositeComponents;
      return (
        (first === oppositeFirst && second === oppositeSecond) ||
        (first === oppositeSecond && second === oppositeFirst)
      );
    });
    if (!opposite) {
      throw new Error(
        `No aspect combines ${oppositeComponents[0]} and ${oppositeComponents[1]}.`,
      );
    }

    resolved.set(current.id, opposite);
    return opposite;
  };

  return resolve(aspect, new Set());
}

export function validateCalculatedOpposites(
  aspects: Aspect[],
  graph: AspectGraph,
): ValidationProblem[] {
  return aspects.flatMap(aspect => {
    try {
      getCalculatedOpposite(aspect, graph);
      return [];
    } catch (error) {
      return [
        {
          aspectId: aspect.id,
          message: `Calculated opposite: ${error instanceof Error ? error.message : 'Calculation failed.'}`,
          severity: 'error' as const,
        },
      ];
    }
  });
}
