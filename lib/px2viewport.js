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
let dataOpts = [
  {
    name: 'dpr',
    value: '1',
  }, {
    name: 'dpr',
    value: '2',
  }, {
    name: 'dpr',
    value: '3',
  }, {
    name: 'rem',
    value: 'true',
  }
]

module.exports = postcss.plugin('postcss-px2viewport', function (options) {

  const opts = objectAssign({}, defaults, options);
  const pxReplace = createPxReplace(opts.viewportWidth, opts.minPixelValue, opts.unitPrecision, opts.viewportUnit);

  return function (root, result) {
    let newRules = [];
    root.walkRules(rule => {
      if (rule.parent.type === 'root') {
        let tempRules = dataOpts.map(opt => {
          return createDataRule(rule, opt.name, opt.value);
        });

        rule.walk(decl => {
          if (decl.type === 'decl') {
            if (declReg.test(decl.value)) {
              const next = decl.next();

              if (next && next.type === 'comment') {
                if (next.text.trim() === 'px') {
                  if (decl.value === '0px') {
                    decl.value = '0';
                  } else {
                    for (let dpr = 1; dpr <= 3; dpr++) {
                      const newDecl = objectAssign({}, decl);
                      const dprReplace = createDprReplace(dpr, opts.baseDpr, 'px', opts.unitPrecision);
                      newDecl.value = newDecl.value.replace(pxReg, dprReplace);
                      tempRules[dpr - 1].nodes.push(newDecl);
                    }
                    decl.remove();
                  }
                }
                next.remove();
              } else {
                const newDecl = objectAssign({}, decl);
                const remReplace = createPxReplace(75 * 100, opts.minPixelValue, opts.unitPrecision, 'rem');
                newDecl.value = newDecl.value.replace(pxReg, remReplace);
                tempRules[tempRules.length - 1].nodes.push(newDecl);
                decl.value = decl.value.replace(pxReg, pxReplace);
              }
            }
          }
        });

        newRules = newRules.concat(tempRules);
      }
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
    let pixels = parseFloat($1);
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
    let pixels = parseFloat($1 * dpr / baseDpr);
    if (pixels <= 0.5) {
      return m;
    }
    return toFixed(pixels, unitPrecision) + unit;
  };
};

function toFixed(number, precision) {
  let multiplier = Math.pow(10, precision + 1);
  let wholeNumber = Math.floor(number * multiplier);
  return Math.round(wholeNumber / 10) * 10 / multiplier;
}

function blacklistedSelector(blacklist, selector) {
  if (typeof selector !== 'string') return;
  return blacklist.some(function (regex) {
    if (typeof regex === 'string') return selector.indexOf(regex) !== -1;
    return selector.match(regex);
  });
}

function createDataRule(rule, name, value) {
  let selectors = rule.selector.split(',');
  let newRule = {
    type: rule.type,
    nodes: [],
    selector: selectors.map(function (sel) {
      return `[data-${name}="${value}"] ${sel.trim()}`;
    }).join(', '), // postcss必须使用字符串，fuck
  }
  return newRule;
}
