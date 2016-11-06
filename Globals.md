### 内容
* [Global Objects](#)
  * [Class:Buffer](#)
  * [__dirname](#)
  * [__filename](#)
  * [clearImmedicate(immedicateObject)](#)
  * [clearInterval(intervalObject)](#)
  * [clearTimeout(timeoutObject)](#)
  * [console](#)
  * [exports](#)
  * [global](#)
  * [module](#)
  * [process](#)
  * [require()](#)
    * [require.cache](#)
    * [require.extensions](#)
    * [require.resolve()](#)
  * [setImmedicate(callback[, ...args])](#)
  * [setInterval(callback,delay[, ...args])](#)
  * [setTimeout(callback,delay[, ...args])](#)

# Global Objects
这些对象在所有的模块中都可以使用,其实,有些对象不在全局作用域上定义的,而是在模块作用域中定义的。
这些对象是在nodejs中特定存在的,这里有许多[built-in Objects](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects)是javascript语言自身具备的。这些也可以在nodejs全局作用域中直接使用。

## Class:Buffer
* `function`
用于处理二进制数据,具体的解释参考[buffer部分](https://nodejs.org/dist/latest-v7.x/docs/api/buffer.html)

## __dirname
* `string`

当前脚本运行所在的文件夹

例如：在`/Users/mjr`运行node example.js
```javascript
  console.log(__dirname);
  // /Users/mjr
```

__dirname不是挂载在全局作用域上,而是挂载在每个模块的局部作用域上

例如：有两个模块a和b,a依赖b,基本的目录结构如下：

* `/Users/mjr/app/a.js`
* `/Users/mjr/app/node_modules/b/b.js`

在b.js中使用__dirname,将返回`/Users/mjr/app/node_modules/b`,然而在a.js中使用__dirname将返回`/Users/mjr/app`

## __filename

* `string`

当__filename被使用的时候,将返回这个文件所在的绝对路径,对于一个入口程序,在命令行中使用的名称并不一定和文件名相同,那这个值就是模块文件的绝对路径。

例如：在`/Users/mjr`中运行`node example.js`
```javascript
console.log(__filename);
// /Users/mjr/example.js
```
__filename不是挂载在全局作用域上,而是挂载在每个模块的局部作用域上

## clearImmediate(immediateObject)
关于clearImmediate的详细描述,请参考[timers](https://nodejs.org/dist/latest-v7.x/docs/api/timers.html)章节

## clearInterval(intervalObject)
关于clearInterval的详细描述,请参考[timers](https://nodejs.org/dist/latest-v7.x/docs/api/timers.html)章节

## clearTimeout(timeoutObject)

关于clearTimeout的详细描述,请参考[timers](https://nodejs.org/dist/latest-v7.x/docs/api/timers.html)章节

## console

* `Object`

用于打印标准输出流和标准错误流,详细内容请参考[console](https://nodejs.org/dist/latest-v7.x/docs/api/console.html)章节

## exports

对`module.exports`的一个简短的引用,关于`exports`和`module.exports`更详细的用法请参考[module system documentation](https://nodejs.org/dist/latest-v7.x/docs/api/modules.html)

exports也不是一个全局性的对象,而是每个模块的局部对象

## global
* `Object` 全局的命名空间对象

在浏览器中,全局作用域是最高级的作用域,这就意味着如果你在全局作用域中`var something`将定义一个全局变量。在nodejs中有所不同,nodejs中最高级的作用于是global作用域。在一个模块中`var something`将只能在这个模块中取到。

## module
* `Object`

对当前模块的一个引用,特别的当`module.exports`被使用去暴露模块中的一些变量的时候。可以通过`require()`去引入这些变量。

`module`不是挂载在全局作用域上,而是挂载在每个模块的局部作用域上

## process
* `Object`

process对象,更多细节参考[process](https://nodejs.org/dist/latest-v7.x/docs/api/process.html#process_process)章节

## require()

* `function`

用于引入模块,更多细节参考[modules](https://nodejs.org/dist/latest-v7.x/docs/api/modules.html#modules_modules)章节

`require`不是挂载在全局作用域上,而是挂载在每个模块的局部作用域上

## require.cache

* `Object`

当一个模块通过require函数被引入的时候,用于缓存模块对象,通过删除这个对象的某个属性,下一次`require`这个模块的时候,就会重新加载这个模块。 注意：这个不能用于`native addons`,否则重新加载会导致错误。

## require.extensions
* `Object`

定义require如何处理特定后缀名的文件

比如：定义以.sjs 结尾的文件按照.js类型的文件进行处理

```javascript
  require.extensions['.sjs'] = require.extensions['.js'];
```
这个方法的主要作用就是在nodejs中加载非js模块,在真正的实践中,有更好的方式去处理这种行为。
这个方法过时了

## require.resolve()

使用内部的require()机制去查找一个模块的位置而不是加载一个模块,仅仅返回模块的文件名。

## setImmediate(immediateObject)
关于setImmediate的详细描述,请参考[timers](https://nodejs.org/dist/latest-v7.x/docs/api/timers.html)章节

## setInterval(intervalObject)
关于setInterval的详细描述,请参考[timers](https://nodejs.org/dist/latest-v7.x/docs/api/timers.html)章节

## setTimeout(timeoutObject)

关于setTimeout的详细描述,请参考[timers](https://nodejs.org/dist/latest-v7.x/docs/api/timers.html)章节
