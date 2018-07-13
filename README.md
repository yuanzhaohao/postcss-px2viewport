## postcss-px2viewport
> 一个postcss插件，结合viewport.js使用

> 默认使用`vw`作为布局单位，对于不支持`vw`单位的，则使用`rem`进行布局

> 对于标记了`/*px*/`的，则转换为`[data-dpr="1"]`、`[data-dpr="2"]`、`[data-dpr="3"]`三种不同的字体

> 对于标记了`/*no*/`的，则不做处理，依然使用px进行布局

### how to use
#### webpack
please run `npm install postcss-loader --save-dev`, and add the code

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

##### input
```css
.class {
  border: 1px solid black;/*no*/
  margin-top: 0px;/*px*/
  font-size: 14px;/*px*/
  background-size: 30px 10px;
}
.class3,
.class4 {
  margin: 0px 20px;
  width: 750px;
  height: 100px;/*px*/
  font-size: 24px;/*px*/
}

@media (min-width: 750px) {
  .class3 {
    font-size: 16px;
    line-height: 22px;
  }
}
```

##### output
```css
.class {
  border: 1px solid black;
  margin-top: 0;
  background-size: 4vw 1.3333333vw;
}
.class3,
.class4 {
  margin: 0px 2.6666667vw;
  width: 100vw;
}

@media (min-width: 100vw) {
  .class3 {
    font-size: 16px;
    line-height: 22px;
  }
}

[data-dpr="1"] .class {
  font-size: 7px;
}

[data-dpr="2"] .class {
  font-size: 14px;
}

[data-dpr="3"] .class {
  font-size: 21px;
}

[data-rem="true"] .class {
  background-size: 0.4rem 0.1333333rem;
}

[data-dpr="1"] .class3, [data-dpr="1"] .class4 {
  height: 50px;
  font-size: 12px;
}

[data-dpr="2"] .class3, [data-dpr="2"] .class4 {
  height: 100px;
  font-size: 24px;
}

[data-dpr="3"] .class3, [data-dpr="3"] .class4 {
  height: 150px;
  font-size: 36px;
}

[data-rem="true"] .class3, [data-rem="true"] .class4 {
  margin: 0px 0.2666667rem;
  width: 10rem;
}
```
### Forbidden Rem or DPR
```javascript
require('postcss-px2viewport')({
  viewportWidth: 750,
  baseDpr: 2,
  isDeleteRem: true,
  isDeleteDpr: true,
})
```
##### input
```
.item {
  float: left;
  width: 210px;
  height: 440px;
  margin-left: 30px;
}
.item-title {
  height: 48px;
  margin-top: 10px;
  line-height: 48px;
  font-size: 28px;/*px*/
  text-align: center;
  color: #494949;
}
```

##### output
```
.item {
  float: left;
  width: 28vw;
  height: 58.6666667vw;
  margin-left: 4vw;
}
.item-title {
  height: 6.4vw;
  margin-top: 1.3333333vw;
  line-height: 6.4vw;
  font-size: 14px;
  text-align: center;
  color: #494949;
}
```


### license
MIT
