#!/usr/bin/env node

import {createWriteStream} from 'node:fs';
import {
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  rename,
  rm,
  writeFile,
} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {basename, dirname, join, relative, resolve, sep} from 'node:path';
import {Readable} from 'node:stream';
import {finished} from 'node:stream/promises';
import {spawn} from 'node:child_process';
import process from 'node:process';

const repository = 'https://github.com/game-icons/icons';
const archiveUrl = `${repository}/archive/refs/heads/master.tar.gz`;
const projectRoot = resolve(dirname(new URL(import.meta.url).pathname), '..');
const publicDirectory = join(projectRoot, 'public');
const destination = join(publicDirectory, 'game-icons');
const staging = join(publicDirectory, `.game-icons-${process.pid}`);
const temporaryDirectory = await mkdtemp(join(tmpdir(), 'game-icons-'));
const archive = join(temporaryDirectory, 'icons.tar.gz');
const source = join(temporaryDirectory, 'source');
const backgroundPath = '<path d="M0 0h512v512H0z"/>';

function run(command: string, args: string[]) {
  return new Promise<void>((resolvePromise, reject) => {
    const child = spawn(command, args, {stdio: 'inherit'});
    child.on('error', reject);
    child.on('exit', code => {
      if (code === 0) resolvePromise();
      else reject(new Error(`${command} exited with code ${code}`));
    });
  });
}

async function collectSvgFiles(directory: string) {
  const files: string[] = [];

  async function walk(currentDirectory: string) {
    const entries = await readdir(currentDirectory, {withFileTypes: true});
    for (const entry of entries) {
      const path = join(currentDirectory, entry.name);
      if (entry.isDirectory()) await walk(path);
      else if (
        entry.isFile() &&
        entry.name.endsWith('.svg') &&
        relative(directory, path).split(sep)[0] !== 'badges'
      )
        files.push(path);
    }
  }

  await walk(directory);
  return files.sort();
}

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

  await finished(
    Readable.fromWeb(response.body).pipe(createWriteStream(archive)),
  );
  await mkdir(source);
  await run('tar', ['-xzf', archive, '-C', source, '--strip-components=1']);

  const svgFiles = await collectSvgFiles(source);
  if (svgFiles.length === 0)
    throw new Error('The upstream archive contained no SVG files');

  await rm(staging, {recursive: true, force: true});
  await mkdir(join(staging, 'svg'), {recursive: true});

  const icons = [];
  for (const sourcePath of svgFiles) {
    const path = relative(source, sourcePath).split(sep).join('/');
    const author = path.split('/')[0];
    const fileName = basename(path, '.svg');
    const destinationPath = join(staging, 'svg', path);

    const svg = await readFile(sourcePath, 'utf8');
    if (!svg.includes(backgroundPath)) {
      throw new Error(
        `Cannot make ${path} transparent: background path not found`,
      );
    }

    await mkdir(dirname(destinationPath), {recursive: true});
    await writeFile(destinationPath, svg.replace(backgroundPath, ''));
    icons.push({
      name: fileName.replaceAll('-', ' '),
      slug: fileName,
      author,
      path: `svg/${path}`,
    });
  }

  const license = await readFile(join(source, 'license.txt'), 'utf8');
  await writeFile(join(staging, 'LICENSE.txt'), license);
  await writeFile(
    join(staging, 'manifest.json'),
    `${JSON.stringify({
      source: repository,
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
  await rm(temporaryDirectory, {recursive: true, force: true});
}
