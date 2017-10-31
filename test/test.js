'use strict';

var assert = require('assert');
var path = require('path');
var fs = require('fs');
var px2viewport = require('..');
var postcss = require('postcss');

var opacity = function (css) {
  css.walkDecls(function (decl) {
    if (decl.prop === 'opacity') {
      decl.parent.insertAfter(decl, {
        prop: '-ms-filter',
        value: '"progid:DXImageTransform.Microsoft.Alpha(Opacity=' + (parseFloat(decl.value) * 100) + ')"'
      });
    }
  });
};

describe('postcss-px2viewport', function () {
  it('[default] should output right viewport file', function () {
    var srcPath = path.join(__dirname, 'source.css');
    var destPath = path.join(__dirname, 'dest.basic.css');
    var srcText = fs.readFileSync(srcPath, {encoding: 'utf8'});
    var outputText = postcss()
      .use(px2viewport({
        viewportWidth: 750
      }))
      .process(srcText).css;

    fs.writeFile(destPath, outputText, function (err) {
      var expectedText = fs.readFileSync(destPath, {encoding: 'utf8'});
      if (err) {
        throw err;
      }
      assert.equal(outputText, expectedText);
    });
  });

  it('should get along well with other plugins', function () {
    var srcPath = path.join(__dirname, 'source.css');
    var destPath = path.join(__dirname, 'dest.multiple.css');
    var srcText = fs.readFileSync(srcPath, {encoding: 'utf8'});
    var outputText = postcss()
      .use(px2viewport({
        viewportWidth: 750
      }))
      .use(opacity)
      .process(srcText).css;

    fs.writeFile(destPath, outputText, function (err) {
      var expectedText = fs.readFileSync(destPath, {encoding: 'utf8'});
      if (err) {
        throw err;
      }
      assert.equal(outputText, expectedText);
    });
  });
});
