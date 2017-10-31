'use strict';

var css = require('css');
var postcss = require('postcss');
var objectAssign = require('object-assign');

var pxRegExp = /\b(\d+(\.\d+)?)px\b/;
var defaults = {
  viewportWidth: 750,
  unitPrecision: 7,
  viewportUnit: 'vw',
  minPixelValue: 1
};

module.exports = postcss.plugin('postcss-px2viewport', function (options) {

  var opts = objectAssign({}, defaults, options);
  var pxReplace = createPxReplace(opts.viewportWidth, opts.minPixelValue, opts.unitPrecision, opts.viewportUnit);

  return function (originCss, result) {
    var cssText = originCss.toString();
    var astObj = css.parse(cssText);
    processRules(astObj.stylesheet.rules);
    var newCssText = css.stringify(astObj);
    var newCss = postcss.parse(newCssText);
    newCss.walkAtRules('media', function (rule) {
      if (rule.params.indexOf('px') === -1) return;
      rule.params = rule.params.replace(pxRegExp, pxReplace);
    });
    result.root = newCss;
  };

  function processRules(rules) {
    for (var i = 0; i < rules.length; i++) {
      var rule = rules[i];
      if (rule.type === 'media') {
        processRules(rule.rules); // recursive invocation while dealing with media queries
        continue;
      } else if (rule.type === 'keyframes') {
        processRules(rule.keyframes); // recursive invocation while dealing with keyframes
        continue;
      } else if (rule.type !== 'rule' && rule.type !== 'keyframe') {
        continue;
      }

      var declarations = rule.declarations;
      for (var j = 0; j < declarations.length; j++) {
        var declaration = declarations[j];
        // need transform: declaration && has 'px'
        if (declaration.type === 'declaration' && pxRegExp.test(declaration.value)) {
          var nextDeclaration = declarations[j + 1];
          if (nextDeclaration && nextDeclaration.type === 'comment' && (nextDeclaration.comment.trim() === 'no' || nextDeclaration.comment.trim() === 'px')) {
            declarations.splice(j + 1, 1);
          } else if (declaration.value.indexOf('px') !== -1) {
            declaration.value = declaration.value.replace(pxRegExp, pxReplace);
          }
        }
      }
    }
  }
});

function createPxReplace(viewportSize, minPixelValue, unitPrecision, viewportUnit) {
  return function (m, $1) {
    if (!$1) return m;
    var pixels = parseFloat($1);
    if (pixels <= minPixelValue) return m;
    return toFixed((pixels / viewportSize * 100), unitPrecision) + viewportUnit;
  };
}

function toFixed(number, precision) {
  var multiplier = Math.pow(10, precision + 1),
    wholeNumber = Math.floor(number * multiplier);
  return Math.round(wholeNumber / 10) * 10 / multiplier;
}

function blacklistedSelector(blacklist, selector) {
  if (typeof selector !== 'string') return;
  return blacklist.some(function (regex) {
    if (typeof regex === 'string') return selector.indexOf(regex) !== -1;
    return selector.match(regex);
  });
}
