/* eslint-disable @typescript-eslint/no-var-requires */
//  getSvg.js
var fs = require('fs');
var path = require('path');
const svgDir = path.resolve(__dirname, './svgIcon');

function readfile(filename) {
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(svgDir, filename), 'utf8', function (err, data) {
      if (err) reject(err);
      resolve({
        [filename.slice(0, filename.lastIndexOf('.'))]: data,
      });
    });
  });
}

//  read all files in dir
function readSvgs() {
  return new Promise((resolve, reject) => {
    fs.readdir(svgDir, function (err, files) {
      if (err) reject(err);
      Promise.all(files.map((filename) => readfile(filename)))
        .then((data) => {
          resolve(data);
        })
        .catch((error) => reject(error));
    });
  });
}

module.exports = {
  readfile,
  readSvgs,
};
