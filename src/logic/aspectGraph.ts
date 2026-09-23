import type {Aspect, AspectId} from '../types/aspect';

export interface AspectGraph {
  byId: Map<AspectId, Aspect>;
  depths: Map<AspectId, number | null>;
  dependents: Map<AspectId, AspectId[]>;
}

export function buildAspectGraph(aspects: Aspect[]): AspectGraph {
  const byId = new Map(aspects.map(aspect => [aspect.id, aspect]));
  const depths = new Map<AspectId, number | null>();
  const dependents = new Map<AspectId, AspectId[]>();

  for (const aspect of aspects) {
    dependents.set(aspect.id, []);
  }
  for (const aspect of aspects) {
    for (const component of aspect.components ?? []) {
      const list = dependents.get(component);
      if (list && !list.includes(aspect.id)) list.push(aspect.id);
    }
  }

  const calculateDepth = (
    id: AspectId,
    visiting: Set<AspectId>,
  ): number | null => {
    if (depths.has(id)) return depths.get(id) ?? null;
    const aspect = byId.get(id);
    if (!aspect || visiting.has(id)) return null;
    if (!aspect.components) {
      depths.set(id, 0);
      return 0;
    }

    const nextVisiting = new Set(visiting).add(id);
    const componentDepths = aspect.components.map(component =>
      calculateDepth(component, nextVisiting),
    );
    const depth = componentDepths.some(value => value === null)
      ? null
      : Math.max(...(componentDepths as number[])) + 1;
    depths.set(id, depth);
    return depth;
  };

  for (const aspect of aspects) calculateDepth(aspect.id, new Set());
  return {byId, depths, dependents};
}

export function getAncestors(id: AspectId, graph: AspectGraph): Aspect[] {
  const found = new Set<AspectId>();
  const visit = (currentId: AspectId) => {
    const current = graph.byId.get(currentId);
    for (const componentId of current?.components ?? []) {
      if (found.has(componentId)) continue;
      found.add(componentId);
      visit(componentId);
    }
  };
  visit(id);
  return [...found].flatMap(ancestorId => graph.byId.get(ancestorId) ?? []);
}

export function getDependents(id: AspectId, graph: AspectGraph): Aspect[] {
  const found = new Set<AspectId>();
  const queue = [...(graph.dependents.get(id) ?? [])];
  while (queue.length > 0) {
    const dependentId = queue.shift();
    if (!dependentId || found.has(dependentId)) continue;
    found.add(dependentId);
    queue.push(...(graph.dependents.get(dependentId) ?? []));
  }
  return [...found].flatMap(dependentId => graph.byId.get(dependentId) ?? []);
}

export function groupAspectsByDepth(aspects: Aspect[], graph: AspectGraph) {
  const groups = new Map<number | null, Aspect[]>();
  for (const aspect of aspects) {
    const depth = graph.depths.get(aspect.id) ?? null;
    groups.set(depth, [...(groups.get(depth) ?? []), aspect]);
  }
  for (const group of groups.values())
    group.sort((a, b) => a.id.localeCompare(b.id));
  return groups;
}
