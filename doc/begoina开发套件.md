

## 模块

begoina可以通过加载模块的形式，增强套件的功能和丰富度。

使用`begoina.use()`方法，将模块的导出对象传入其中。

开发增强模块，需要导出一个模块对象，应当具有以下格式:

```js
module.exports = {
    decorator(vmp){},
    setup(){}
};
```

decorator是用来包装begoina创建出来的vmp(`viewModuleProxy`)对象的。在这个函数，可以根据模块的需要，将一些方法或者属性附加在vmp对象上。
这样在小程序页面或组件的使用中，可以通过直接通过`this.vmp.[prop]/this.vmp.[method]()`等方式，使用模块所提供的功能。

setup是用来启动增强模块的，它会在begoina启动的时候再内部调用。如果模块需要初始化，那么就从这里开始吧。