'use strict';

var css = require('css');
var postcss = require('postcss');
var objectAssign = require('object-assign');

var declReg = /\b(\d+(\.\d+)?)px\b/;
var pxReg = /"[^"]+"|'[^']+'|url\([^\)]+\)|(\d*\.?\d+)px/ig;
var defaults = {
  viewportWidth: 750,
  unitPrecision: 7,
  viewportUnit: 'vw',
  minPixelValue: 1,
  baseDpr: 2,
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
      rule.params = rule.params.replace(pxReg, pxReplace);
    });
    result.root = newCss;
  };

  function processRules(rules, noDealPx) {
    for (var i = 0; i < rules.length; i++) {
      var rule = rules[i];
      if (rule.type === 'media') {
        processRules(rule.rules);
        continue;
      } else if (rule.type === 'keyframes') {
        processRules(rule.keyframes, true);
        continue;
      } else if (rule.type !== 'rule' && rule.type !== 'keyframe') {
        continue;
      }

      if (!noDealPx) {
        var newRules = [];
        for (var dpr = 1; dpr <= 3; dpr++) {
          var newRule = {};
          newRule.type = rule.type;
          if (rule.selectors && rule.selectors.length) {
            newRule.selectors = rule.selectors.map(function (sel) {
              return '[data-dpr="' + dpr + '"] ' + sel;
            });
          }
          newRule.declarations = [];
          newRules.push(newRule);
        }
      }

      var decls = rule.declarations;
      for (var j = 0; j < decls.length; j++) {
        var decl = decls[j];
        if (decl.type === 'declaration' && declReg.test(decl.value)) {
          var nextDecl = decls[j + 1];
          if (nextDecl && nextDecl.type === 'comment') {
            if (nextDecl.comment.trim() === 'px') {
              if (decl.value === '0px') {
                decl.value = '0';
                decls.splice(j + 1, 1);
                continue;
              }
              if (!noDealPx) {
                for (var dpr = 1; dpr <= 3; dpr++) {
                  var newDecl = objectAssign({}, decl);
                  var dprReplace = createDprReplace(dpr, opts.baseDpr, 'px', opts.unitPrecision);
                  newDecl.value = newDecl.value.replace(pxReg, dprReplace);
                  newRules[dpr - 1].declarations.push(newDecl);
                }
                decls.splice(j, 2);
                j--;
              } else {
                decl.value = decl.value.replace(pxReg, pxReplace);
                decls.splice(j + 1, 1);
              }
            } else if (nextDecl.comment.trim() === 'no') {
              decls.splice(j + 1, 1);
            } else if (decl.value.indexOf('px') !== -1) {
              decl.value = decl.value.replace(pxReg, pxReplace);
            }
          } else if (decl.value.indexOf('px') !== -1) {
            decl.value = decl.value.replace(pxReg, pxReplace);
          }
        }
      }

      if (!rules[i].declarations.length) {
        rules.splice(i, 1);
        i--;
      }

      if (!noDealPx) {
        if (newRules[0].declarations.length) {
          rules.splice(i + 1, 0, newRules[0], newRules[1], newRules[2]);
          i += 3;
        }
      }
    }
  }

});

function createPxReplace(viewportSize, minPixelValue, unitPrecision, unit) {
  return function (m, $1) {
    if (!$1) {
      return m;
    }
    var pixels = parseFloat($1);
    if (pixels <= minPixelValue) {
      return m;
    }
    return toFixed((pixels / viewportSize * 100), unitPrecision) + unit;
  };
}

function createDprReplace(dpr, baseDpr, unit, unitPrecision) {
  return function (m, $1) {
    if (!$1) {
      return m;
    }
    return toFixed(parseFloat($1) * dpr / baseDpr, unitPrecision) + unit;
  };
};

function toFixed(number, precision) {
  var multiplier = Math.pow(10, precision + 1);
  var wholeNumber = Math.floor(number * multiplier);
  return Math.round(wholeNumber / 10) * 10 / multiplier;
}

function blacklistedSelector(blacklist, selector) {
  if (typeof selector !== 'string') return;
  return blacklist.some(function (regex) {
    if (typeof regex === 'string') return selector.indexOf(regex) !== -1;
    return selector.match(regex);
  });
}
