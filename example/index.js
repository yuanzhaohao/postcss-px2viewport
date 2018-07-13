'use strict';

var fs = require('fs');
var path = require('path');
var postcss = require('postcss');
var px2viewport = require('..');
var srcPath = path.join(__dirname, 'source-sharing.css');
var destPath = path.join(__dirname, 'dest-sharing.css');
var srcText = fs.readFileSync(srcPath, 'utf8');
var outputText = postcss(px2viewport({
  viewportWidth: 750,
  baseDpr: 2,
  isDeleteRem: true,
  isDeleteDpr: true,
})).process(srcText).css;

fs.writeFile(destPath, outputText, function(err) {
  if (err) {
    throw err;
  }
  console.log('File with viewport units written.');
});
