import type {Aspect, ValidationProblem} from '../types/aspect';
import {validateAspects} from './validation';

export function parseAspectJson(
  text: string,
  allowSemanticErrors = false,
): {
  data: Aspect[] | null;
  problems: ValidationProblem[];
} {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    return {
      data: null,
      problems: [
        {message: 'The selected file is not valid JSON.', severity: 'error'},
      ],
    };
  }
  if (!Array.isArray(value))
    return {
      data: null,
      problems: [
        {
          message: 'The JSON root must be an array of aspects.',
          severity: 'error',
        },
      ],
    };

  const shapeProblems: ValidationProblem[] = [];
  for (const [index, item] of value.entries()) {
    const record =
      typeof item === 'object' && item !== null
        ? (item as Record<string, unknown>)
        : null;
    const components = record?.components;
    const validComponents =
      components === null ||
      (Array.isArray(components) &&
        components.length === 2 &&
        components.every(part => typeof part === 'string'));
    if (
      !record ||
      typeof record.id !== 'string' ||
      !(
        record.description === undefined ||
        typeof record.description === 'string'
      ) ||
      typeof record.color !== 'string' ||
      typeof record.icon !== 'object' ||
      record.icon === null ||
      typeof (record.icon as Record<string, unknown>).id !== 'string' ||
      !validComponents ||
      !(record.opposite === null || typeof record.opposite === 'string')
    ) {
      shapeProblems.push({
        message: `Item ${index + 1} does not match the Aspect data shape.`,
        severity: 'error',
      });
    }
  }
  if (shapeProblems.length > 0) return {data: null, problems: shapeProblems};

  const data: Aspect[] = value.map(item => {
    const aspect = item as Omit<Aspect, 'description'> & {description?: string};
    return {...aspect, description: aspect.description ?? ''};
  });
  const problems = validateAspects(data);
  return {
    data:
      !allowSemanticErrors &&
      problems.some(problem => problem.severity === 'error')
        ? null
        : data,
    problems,
  };
}

export function downloadAspectJson(aspects: Aspect[]) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(aspects, null, 2)], {type: 'application/json'}),
  );
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'aspects.json';
  anchor.click();
  URL.revokeObjectURL(url);
}
