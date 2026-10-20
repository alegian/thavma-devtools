import {strToU8, zipSync} from 'fflate';
import {svgAsPngUri} from 'save-svg-as-png';
import type {Aspect} from '../types/aspect';

export interface IconExportOptions {
  size: number;
  foreground: string;
  background: string;
  shadow: {
    color: string;
    blur: number;
    x: number;
    y: number;
    side: 'in' | 'out';
  };
  assetRoot: string;
  archiveName: string;
}

export const defaultIconExportOptions: IconExportOptions = {
  size: 64,
  foreground: '#ffffff',
  background: 'transparent',
  shadow: {color: '#000000', blur: 16, x: 0, y: 0, side: 'out'},
  assetRoot: `${import.meta.env.BASE_URL}game-icons/`,
  archiveName: 'aspect-icons.zip',
};

const svgNamespace = 'http://www.w3.org/2000/svg';

// Mirrors Game-icons Studio's Shadow and Icon components:
// https://game-icons.net/static/js/8.c9fbd0ff.chunk.js
// Keep the 512-unit viewBox: Studio's blur is NOT measured in output pixels.
export function createExportSvg(path: string, options: IconExportOptions) {
  const element = (
    name: string,
    attributes: Record<string, string | number>,
  ) => {
    const node = document.createElementNS(svgNamespace, name);
    for (const [key, value] of Object.entries(attributes))
      node.setAttribute(key, String(value));
    return node;
  };
  const svg = document.createElementNS(svgNamespace, 'svg');
  svg.setAttribute('xmlns', svgNamespace);
  svg.setAttribute('viewBox', '0 0 512 512');
  svg.style.height = `${options.size}px`;
  svg.style.width = `${options.size}px`;
  const defs = element('defs', {});
  const filter = element('filter', {
    id: 'shadow-1',
    height: '300%',
    width: '300%',
    x: '-100%',
    y: '-100%',
  });
  const shadow = options.shadow;
  filter.append(
    element('feFlood', {'flood-color': shadow.color, result: 'flood'}),
    element('feComposite', {
      in: 'flood',
      in2: 'SourceGraphic',
      operator: shadow.side === 'in' ? 'out' : 'atop',
      result: 'composite',
    }),
  );
  if (shadow.blur)
    filter.append(
      element('feGaussianBlur', {
        in: 'composite',
        stdDeviation: shadow.blur,
        result: 'blur',
      }),
    );
  filter.append(
    element('feOffset', {dx: shadow.x, dy: shadow.y, result: 'offset'}),
    element(
      'feComposite',
      shadow.side === 'in'
        ? {in2: 'SourceGraphic', in: 'offset', operator: 'atop'}
        : {in: 'SourceGraphic', in2: 'offset', operator: 'over'},
    ),
  );
  defs.append(filter);
  const group = element('g', {});
  group.append(
    element('path', {
      d: path,
      fill: options.foreground,
      'fill-opacity': '1',
      filter: 'url(#shadow-1)',
    }),
  );
  svg.append(
    defs,
    element('path', {
      d: 'M0 0h512v512H0z',
      fill: options.background,
    }),
    group,
  );
  return svg;
}

export async function downloadIcons(
  aspects: readonly Aspect[],
  overrides: Partial<Omit<IconExportOptions, 'shadow'>> & {
    shadow?: Partial<IconExportOptions['shadow']>;
  } = {},
  onProgress?: (completed: number, total: number) => void,
) {
  const options = {
    ...defaultIconExportOptions,
    ...overrides,
    shadow: {...defaultIconExportOptions.shadow, ...overrides.shadow},
  };
  if (!Number.isInteger(options.size) || options.size <= 0)
    throw new Error('Icon size must be a positive integer.');
  if (
    ![options.shadow.blur, options.shadow.x, options.shadow.y].every(
      Number.isFinite,
    ) ||
    options.shadow.blur < 0
  )
    throw new Error('Invalid icon shadow settings.');
  if (!aspects.length) throw new Error('There are no aspects to export.');

  const files: Record<string, Uint8Array> = Object.create(null);
  const credits = new Set<string>();
  const paths = new Map<string, string>();
  for (const [index, aspect] of aspects.entries()) {
    if (!/^[a-zA-Z0-9_-]+$/.test(aspect.id))
      throw new Error(`Cannot use aspect ID as a filename: ${aspect.id}`);
    const filename = `${aspect.id}.png`;
    if (Object.hasOwn(files, filename))
      throw new Error(`Duplicate aspect ID: ${aspect.id}`);
    if (!/^svg\/[a-z0-9-]+\/[a-z0-9-]+\.svg$/.test(aspect.icon.id))
      throw new Error(`Invalid icon path for ${aspect.id}.`);
    let path = paths.get(aspect.icon.id);
    if (!path) {
      const response = await fetch(`${options.assetRoot}${aspect.icon.id}`);
      if (!response.ok)
        throw new Error(
          `Could not load icon for ${aspect.id} (${response.status}).`,
        );
      const source = new DOMParser().parseFromString(
        await response.text(),
        'image/svg+xml',
      );
      const foreground = source.documentElement.lastElementChild;
      path = foreground?.getAttribute('d') ?? '';
      if (
        source.querySelector('parsererror') ||
        foreground?.localName !== 'path' ||
        !path ||
        source.documentElement.getAttribute('viewBox') !== '0 0 512 512'
      )
        throw new Error(`Invalid SVG foreground for ${aspect.id}.`);
      paths.set(aspect.icon.id, path);
    }
    // Same library and DPR-compensated scale as Studio's Download component:
    // https://game-icons.net/static/js/10.0edd0dc5.chunk.js
    // Exclude host-app CSS so it cannot alter the standalone Studio SVG.
    const uri = await svgAsPngUri(createExportSvg(path, options), {
      scale: 1 / (512 / options.size) / (window.devicePixelRatio ?? 1),
      excludeCss: true,
    });
    const binary = atob(uri.slice(uri.indexOf(',') + 1));
    files[filename] = Uint8Array.from(binary, character =>
      character.charCodeAt(0),
    );
    const [, author, slug] = aspect.icon.id.split('/');
    credits.add(
      `${aspect.id}: ${author} — https://game-icons.net/1x1/${author}/${slug.replace('.svg', '.html')}`,
    );
    onProgress?.(index + 1, aspects.length);
  }
  const license = await fetch(`${options.assetRoot}LICENSE.txt`);
  if (!license.ok) throw new Error('Could not load the icon license.');
  files['LICENSE.txt'] = new Uint8Array(await license.arrayBuffer());
  files['CREDITS.txt'] = strToU8(
    `Icons from game-icons.net, CC BY 3.0.\nhttps://creativecommons.org/licenses/by/3.0/\n\n${[...credits].join('\n')}\n`,
  );
  const archive = zipSync(files);
  const url = URL.createObjectURL(
    new Blob([new Uint8Array(archive)], {type: 'application/zip'}),
  );
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = options.archiveName;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
