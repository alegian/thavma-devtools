export type AspectId = string;

export interface Aspect {
  id: AspectId;
  color: string;
  icon: {
    id: string;
  };
  components: [AspectId, AspectId] | null;
  opposite: AspectId | null;
}

export interface GameIcon {
  name: string;
  slug: string;
  author: string;
  path: string;
}

export interface ValidationProblem {
  aspectId?: AspectId;
  message: string;
  severity: 'error' | 'warning';
}
