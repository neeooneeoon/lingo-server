import fs from 'fs';
import path from 'path';
import md5 from 'md5';

function renameImageFiles(pathFolder: string) {
  fs.readdir(pathFolder, (err, files) => {
    if (err) throw err;
    files.forEach((file) => {
      const [name, _] = file.split('.');
      const ext = path.extname(file);
      const hash = md5(name).concat(ext);
      fs.rename(
        path.join(pathFolder, file),
        path.join(pathFolder, hash),
        (err) => {
          if (err) throw err;
        },
      );
    });
  });
}

function run() {
  const listPaths = [path.join(__dirname, '/TA3-DEMO')];
  listPaths.forEach((pathFolder) => renameImageFiles(pathFolder));
}

run();
