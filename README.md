## postcss-px2viewport
> A tool for postcss

### how to use

#### node
```javascript
var px2viewport = require('..');
var postcss = require('postcss');
var outputText = postcss()
  .use(px2viewport({
    viewportWidth: 750
  }))
  .process(srcText).css;
```

#### webpack
please run `npm install postcss-loader`, and add the code

```javascript
var px2viewport = require('postcss-px2viewport');

module.exports = {
  module: {
    loaders: [
      {
        test: /\.css$/,
        loader: "style-loader!css-loader!postcss-loader"
      }
    ]
  },
  postcss: function() {
    return [px2viewport({viewportWidth: 750})];
  }
}
```

### license
MIT
