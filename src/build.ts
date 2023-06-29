import { readFileSync, readdirSync, writeFileSync, copyFileSync, mkdirSync, rmSync } from "fs";
import path, { join } from "path";
import JSZip from "jszip";

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

function build() {
  rmSync(join(__dirname, '..', 'Ringon.zip'));

  copyDir(
    ['config', 'env'],
    ['web', 'static'],
    ['web', 'views'],
  );
  
  copyFileSync(join(__dirname, '..', 'package.json'), join(__dirname, '..', 'out', 'package.json'));
  
  add_zip(new JSZip(), join(__dirname, '..', 'out'))
    .generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' })
    .then(content => { writeFileSync('Ringon.zip', content); });
  
  rmSync(join(__dirname, '..', 'out'), { recursive: true, force: true });
}  

build();
