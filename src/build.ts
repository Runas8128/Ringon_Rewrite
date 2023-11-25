import { readFileSync, readdirSync, writeFileSync, copyFileSync, mkdirSync, rmSync, existsSync } from "fs";
import path, { join } from "path";
import { stdin, stdout } from "process";
import * as ReadLine from "readline/promises";

import JSZip from "jszip";

import { Logger } from "./logger";
import { isTesting } from "./config/options/client_options";

Logger.root = join(__dirname, 'index.ts');
const logger = Logger.getLogger(__filename);

function add_zip(zip: JSZip, path_: string) {
  const dir_list = readdirSync(path_, { withFileTypes: true });

  dir_list
    .filter(dir => dir.isFile())
    .forEach(dir => {
      const file = path.join(path_, dir.name);
      zip.file(dir.name, readFileSync(file));
    });

  dir_list
    .filter(dir => dir.isDirectory())
    .forEach(dir => {
      const folder = zip.folder(dir.name);
      if (folder) add_zip(folder, path.join(path_, dir.name));
      else console.log(`[ERROR] Cannot zip ${dir.name}`);
    });

  return zip;
}

function copyDir(...paths: string[][]) {
  paths.forEach(path => {
    mkdirSync(join(__dirname, '..', 'out', ...path));
    const dir = readdirSync(join(__dirname, ...path), { withFileTypes: true });
    dir.filter(elem => elem.isFile())
      .forEach(file => copyFileSync(join(__dirname, ...path, file.name), join(__dirname, '..', 'out', ...path, file.name)));
    dir.filter(elem => elem.isDirectory())
      .forEach(directory => copyDir([...path, directory.name]));
  });
}

async function valid_check() {
  if (!isTesting) return;

  logger.warn("testing flag turned on!!");
  const readline = ReadLine.createInterface({ input: stdin, output: stdout });
  const answer = await readline.question("Would you like to build it anyway? (Y/n) ");
  readline.close();
  if (answer.toLocaleLowerCase() === 'n') {
    logger.info("Aborting...");
    process.kill(1);
  }
  logger.warn("This build is dev only!!");
}

function build() {
  logger.info('Build start');

  logger.info('removing old build file (1/4)');
  if (existsSync(join(__dirname, '..', 'Ringon.zip')))
    rmSync(join(__dirname, '..', 'Ringon.zip'));

  logger.info('copying assets (non-ts files) to output (2/4)');
  copyDir(
    ['config', 'env'],
    ['web', 'static'],
    ['web', 'views'],
  );
  copyFileSync(join(__dirname, '..', 'package.json'), join(__dirname, '..', 'out', 'package.json'));

  logger.info('zipping output code (3/4)');
  add_zip(new JSZip(), join(__dirname, '..', 'out'))
    .generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' })
    .then(content => { writeFileSync('Ringon.zip', content); });
    
  logger.info('deleting output folder (4/4)');
  rmSync(join(__dirname, '..', 'out'), { recursive: true, force: true });

  logger.info('Build Success!!');
}

valid_check().then(build).catch(() => {});
