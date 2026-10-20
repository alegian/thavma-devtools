#!/usr/bin/env node

import {mkdir, rename, rm, writeFile} from 'node:fs/promises';
import {basename, dirname, join, resolve} from 'node:path';
import process from 'node:process';
import {strFromU8, unzipSync} from 'fflate';

const repository = 'https://github.com/game-icons/icons';
// Use the website's optimized paths, not the repository originals: even
// visually equivalent path optimizations can change rasterized edge pixels.
const archiveUrl =
  'https://game-icons.net/archives/ffffff/transparent/game-icons.net.svg.zip';
const sourcePrefix = 'icons/ffffff/transparent/1x1/';
const projectRoot = resolve(dirname(new URL(import.meta.url).pathname), '..');
const publicDirectory = join(projectRoot, 'public');
const destination = join(publicDirectory, 'game-icons');
const staging = join(publicDirectory, `.game-icons-${process.pid}`);

try {
  console.log(`Downloading ${archiveUrl}`);
  const response = await fetch(archiveUrl, {
    headers: {'User-Agent': 'thavma-devtools-icon-updater'},
  });
  if (!response.ok || !response.body) {
    throw new Error(
      `Download failed: ${response.status} ${response.statusText}`,
    );
  }

  const files = unzipSync(new Uint8Array(await response.arrayBuffer()));
  const svgFiles = Object.keys(files)
    .filter(path => path.startsWith(sourcePrefix) && path.endsWith('.svg'))
    .sort();
  if (svgFiles.length === 0)
    throw new Error('The upstream archive contained no SVG files');

  await rm(staging, {recursive: true, force: true});
  await mkdir(join(staging, 'svg'), {recursive: true});

  const icons = [];
  for (const sourcePath of svgFiles) {
    const path = sourcePath.slice(sourcePrefix.length);
    if (!/^[a-z0-9-]+\/[a-z0-9-]+\.svg$/.test(path))
      throw new Error(`Unsupported icon path: ${path}`);
    const author = path.split('/')[0];
    const fileName = basename(path, '.svg');
    const destinationPath = join(staging, 'svg', path);

    const svg = strFromU8(files[sourcePath]);

    // Studio exports only the final foreground path on a 512-unit canvas.
    // Fail loudly if upstream changes that contract instead of exporting
    // incomplete or differently scaled icons at runtime.
    if (
      !svg.includes('viewBox="0 0 512 512"') ||
      (svg.match(/<path\b/g) ?? []).length !== 1 ||
      !/<path\b[^>]*\bd="[^"]+"[^>]*\/>\s*<\/svg>/.test(svg)
    )
      throw new Error(`Unsupported Studio foreground structure: ${path}`);

    await mkdir(dirname(destinationPath), {recursive: true});
    await writeFile(destinationPath, svg);
    icons.push({
      name: fileName.replaceAll('-', ' '),
      slug: fileName,
      author,
      path: `svg/${path}`,
    });
  }

  const license = files['icons/license.txt'];
  if (!license) throw new Error('The upstream archive contained no license');
  await writeFile(join(staging, 'LICENSE.txt'), license);
  await writeFile(
    join(staging, 'manifest.json'),
    `${JSON.stringify({
      source: repository,
      archive: archiveUrl,
      license: 'CC BY 3.0',
      updatedAt: new Date().toISOString(),
      count: icons.length,
      icons,
    })}\n`,
  );

  await rm(destination, {recursive: true, force: true});
  await rename(staging, destination);
  console.log(
    `Updated ${icons.length.toLocaleString()} SVG icons in public/game-icons`,
  );
} finally {
  await rm(staging, {recursive: true, force: true});
}
