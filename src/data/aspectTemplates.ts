import type {Aspect} from '../types/aspect';
import {sampleAspects} from './sampleAspects';
import {thaumcraft6Aspects} from './thaumcraft6Aspects';

export interface AspectTemplate {
  id: string;
  name: string;
  description: string;
  create: () => Aspect[];
}

export const aspectTemplates: AspectTemplate[] = [
  {
    id: 'thaumcraft-6',
    name: 'Thaumcraft 6',
    description: 'The 37 base aspects and wiki-listed compositions.',
    create: () => structuredClone(thaumcraft6Aspects),
  },
  {
    id: 'sample',
    name: 'Demo sample',
    description: 'Primals and compounds across several depths.',
    create: () => structuredClone(sampleAspects),
  },
  {
    id: 'near-empty',
    name: 'Near empty',
    description: 'One editable primal aspect and nothing else.',
    create: () => [
      {
        id: 'new-aspect',
        color: '#d9a94a',
        icon: {id: 'svg/lorc/crystal-growth.svg'},
        components: null,
        opposite: null,
      },
    ],
  },
];
