'use strict';

var postcss = require('postcss');
var objectAssign = require('object-assign');

const declReg = /\b(\d+(\.\d+)?)px\b/;
const pxReg = /"[^"]+"|'[^']+'|url\([^\)]+\)|(\d*\.?\d+)px/ig;
let defaults = {
  viewportWidth: 750,
  unitPrecision: 7,
  viewportUnit: 'vw',
  minPixelValue: 1,
  baseDpr: 2,
};

module.exports = postcss.plugin('postcss-px2viewport', function (options) {

  const opts = objectAssign({}, defaults, options);
  const pxReplace = createPxReplace(opts.viewportWidth, opts.minPixelValue, opts.unitPrecision, opts.viewportUnit);

  return function (root, result) {
    let newRules = [];
    root.walkRules(rule => {
      const isParentRoot = rule.parent.type === 'root';
      const tempRules = [];
      if (isParentRoot) {
        for (let dpr = 1; dpr <= 3; dpr++) {
          tempRules.push({
            type: rule.type,
            selector: '[data-dpr="' + dpr + '"] ' + rule.selector,
            nodes: []
          });
        }
      }
      rule.walk(decl => {
        if (decl.type === 'decl') {
          if (declReg.test(decl.value)) {
            const next = decl.next();

            if (next && next.type === 'comment') {
              if (next.text.trim() === 'px') {
                if (decl.value === '0px') {
                  decl.value = '0';
                } else {
                  if (isParentRoot) {
                    for (let dpr = 1; dpr <= 3; dpr++) {
                      const newDecl = objectAssign({}, decl);
                      const dprReplace = createDprReplace(dpr, opts.baseDpr, 'px', opts.unitPrecision);
                      newDecl.value = newDecl.value.replace(pxReg, dprReplace);
                      tempRules[dpr - 1].nodes.push(newDecl);
                    }
                    decl.remove();
                  }
                }
              }
              next.remove();
            } else {
              decl.value = decl.value.replace(pxReg, pxReplace);
            }
          }
        }
      });

      newRules = newRules.concat(tempRules);
    });
    root.append(newRules);
    root.walkAtRules('media', function (rule) {
      if (rule.params.indexOf('px') === -1) {
        return;
      }
      rule.params = rule.params.replace(pxReg, pxReplace);
    });
  };
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
    var pixels = parseFloat($1 * dpr / baseDpr);
    if (pixels <= 0.5) {
      return m;
    }
    return toFixed(pixels, unitPrecision) + unit;
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
