import {buildAspectGraph} from './aspectGraph';
import type {Aspect, ValidationProblem} from '../types/aspect';

const idPattern = /^[a-z][a-z0-9-]*$/;
const colorPattern = /^#[0-9a-f]{6}$/i;

export function validateAspects(aspects: Aspect[]): ValidationProblem[] {
  const problems: ValidationProblem[] = [];
  const counts = new Map<string, number>();
  for (const aspect of aspects)
    counts.set(aspect.id, (counts.get(aspect.id) ?? 0) + 1);
  const ids = new Set(aspects.map(aspect => aspect.id));

  for (const aspect of aspects) {
    if (!idPattern.test(aspect.id))
      problems.push({
        aspectId: aspect.id,
        message:
          'ID must be lowercase and contain only letters, numbers, or hyphens.',
        severity: 'error',
      });
    if ((counts.get(aspect.id) ?? 0) > 1)
      problems.push({
        aspectId: aspect.id,
        message: 'Duplicate aspect ID.',
        severity: 'error',
      });
    if (!colorPattern.test(aspect.color))
      problems.push({
        aspectId: aspect.id,
        message: 'Color must be a six-digit hex value.',
        severity: 'error',
      });
    if (!aspect.icon.id)
      problems.push({
        aspectId: aspect.id,
        message: 'Icon is missing.',
        severity: 'warning',
      });
    for (const component of aspect.components ?? []) {
      if (!ids.has(component))
        problems.push({
          aspectId: aspect.id,
          message: `Component “${component}” does not exist.`,
          severity: 'error',
        });
      if (component === aspect.id)
        problems.push({
          aspectId: aspect.id,
          message: 'An aspect cannot directly compose itself.',
          severity: 'error',
        });
    }
    if (aspect.opposite && !ids.has(aspect.opposite))
      problems.push({
        aspectId: aspect.id,
        message: `Opposite “${aspect.opposite}” does not exist.`,
        severity: 'error',
      });
    if (aspect.opposite === aspect.id)
      problems.push({
        aspectId: aspect.id,
        message: 'An aspect cannot be its own opposite.',
        severity: 'error',
      });
    if (aspect.opposite) {
      const opposite = aspects.find(
        candidate => candidate.id === aspect.opposite,
      );
      if (opposite && opposite.opposite !== aspect.id)
        problems.push({
          aspectId: aspect.id,
          message: `Opposite relationship with “${aspect.opposite}” is not symmetric.`,
          severity: 'warning',
        });
    }
  }

  const graph = buildAspectGraph(aspects);
  for (const aspect of aspects) {
    if (
      aspect.components &&
      graph.depths.get(aspect.id) === null &&
      aspect.components.every(id => ids.has(id))
    ) {
      problems.push({
        aspectId: aspect.id,
        message: 'Composition contains a dependency cycle.',
        severity: 'error',
      });
    }
  }
  return problems;
}
