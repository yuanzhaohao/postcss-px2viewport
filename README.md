## postcss-px2viewport
> A tool for postcss

#### how to use

```javascript
var px2viewport = require('..');
var postcss = require('postcss');
var outputText = postcss()
  .use(px2viewport({
    viewportWidth: 750
  }))
  .process(srcText).css;
```
