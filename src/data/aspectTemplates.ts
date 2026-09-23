import type {Aspect} from '../types/aspect';
import {thaumcraft4Aspects} from './thaumcraft4Aspects';
import {thaumcraft6Aspects} from './thaumcraft6Aspects';

export interface AspectTemplate {
  id: string;
  name: string;
  description: string;
  create: () => Aspect[];
}

export const aspectTemplates: AspectTemplate[] = [
  {
    id: 'thaumcraft-4',
    name: 'Thaumcraft 4',
    description: 'The 48 current base aspects and wiki-listed compositions.',
    create: () => structuredClone(thaumcraft4Aspects),
  },
  {
    id: 'thaumcraft-6',
    name: 'Thaumcraft 6',
    description: 'The 37 base aspects and wiki-listed compositions.',
    create: () => structuredClone(thaumcraft6Aspects),
  },
];
