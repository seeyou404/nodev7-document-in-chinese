### 内容
* [Path](#)
  * [Windows vs POSIX](#)
  * [path.basename(path[,ext])](#)
  * [path.dilimiter](#)
  * [path.dirname(path)](#)
  * [path.extname(path)](#)
  * [path.format(pathObject)](#)
  * [path.isAbsolute(path)](#)
  * [path.join([...path])](#)
  * [path.normalize(path)](#)
  * [path.parse(path)](#)
  * [path.posix](#)
  * [path.relative(from,to)](#)
  * [path.resolve([...path])](#)
  * [path.sep](#)
  * [path.win32](#)

# Path
path模块提供了操作文件和文件夹路径的一些方法。可以使用以下的方式引入
```javascript
  const path = require('path');
```

## Windows vs POSIX
path模块默认的操作是随着nodejs多运行的操作系统的不同而改变。也就是说,当运行在windows操作系统的时候,path模块会假定windows风格的path形式被使用。

例如：当使用path.basename()函数去获取window风格的路径C:\temp\myfile.html的时候,在POSIX和windows平台上会获取到不同的结果
在POSIX上：
```javascript
path.basename('C:\\temp\\myfile.html');
 // returns 'C:\temp\myfile.html'
```
在windows上：
```javascript
path.basename('C:\\temp\\myfile.html');
// returns 'myfile.html'
```
为了让windows风格的路径在不同的操作系统上得到相同的结果, 可以使用[path.win32](#)

在POSIX和windows上：
```javascript
path.win32.basename('C:\\temp\\myfile.html');
  // returns 'myfile.html'
```
为了让POSIX风格的路径在不同的操作系统上得到相同的结果, 可以使用[path.posix](#)
```javascript
path.posix.basename('/tmp/myfile.html')；
 // returns 'myfile.html'
```

## path.basename(path[, ext])
* path 字符串
* ext 一个可选的文件后缀
  path.basename()返回路径的最后一部分,类似于Unix系统中的basename命令

例如：
```javascript
  path.basename('/foo/bar/baz/asdf/quux.html');
  // return  quux.html

  path.basename('/foo/bar/baz/asdf/quux.html', '.html');
  // return  quux
```

如果path和ext中的任一个不是字符串就会抛出一个TypeError

## path.delimiter
提供不同平台的路径分隔符
* ; windows
* : POSIX

在POSIX：
```javascript
  console.log(process.env.PATH);
  // '/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/bin'

  process.env.PATH.split(path.delimiter);
  // returns ['C:\\Windows\\system32', 'C:\\Windows', 'C:\\Program Files\\node\\']
```

## path.dirname(path)
* path 字符串
这个方法返回路径所在的文件夹,类似于Unix系统中的dirname命令

```javascript
path.dirname('/foo/bar/baz/asdf/quux');
// returns '/foo/bar/baz/asdf'
```
如果path不是一个字符串将会你抛出TypeError的错误

##  path.extname(path)
* path 字符串
path.extname()返回路径的后缀, 也就是返回.最后一次出现的地方到路径的结尾处。如果path的最后一部分无.或者路径的basename的第一个字符是.此时则返回一个空字符串

```javascript
path.extname('index.html')
// returns '.html'

path.extname('index.coffee.md')
// returns '.md'

path.extname('index.')
// returns '.'

path.extname('index')
// returns ''

path.extname('.index')
// returns ''
```
如果path不是一个字符串将会你抛出TypeError的错误

## path.format(pathObject)
* pathObject 对象
  * dir 字符串
  * root 字符串
  * base 字符串
  * name 字符串
  * ext 字符串

path.format()将一个对象转换成path字符串。和path.parse()的作用相反

构建一个路径字符串将经过以下几个过程：
* output被设置为一个空字符串
* 如果pathObject.dir被设置了,pathObject.dir结合path.sep(default分隔符)将会被添加到output中
* 否则,如果pathObject.root被设置了,将pathObject.root添加到output
* 如果pathObject.base被设置了,将pathObject.base添加到output
* 否则
  * 如果pathObject.name被设置了,将pathObject.name添加到output
  * 如果pathObject.ext被设置了,将pathObject.ext添加到output
* 返回output

例如：在POSIX上

```javascript
// 如果 `dir` and `base` 被提供了,
// `${dir}${path.sep}${base}`
// 将会被返回
path.format({
  dir:'/home/user/dir',
  base:'file.txt'
})
// 返回 '/home/user/dir/file.txt'

// 如果'dir'没有被提供,'root'将会被使用
// 如果只有'root'被提供或者'dir'和root是相等的
// 则平台的分隔符将会被包含
path.format({
  root:'/',
  name:'file',
  ext:'.txt'
})
// 返回'/file.txt'

// base将会被返回如果dir和root都没有被提供,
path.format({
  base:'file.txt'
})
// 返回'file.txt'
```

在windows上
```javascript
path.format({
    root : "C:\\",
    dir : "C:\\path\\dir",
    base : "file.txt",
    ext : ".txt",
    name : "file"
});
// returns 'C:\\path\\dir\\file.txt'
```

## path.isAbsolute(path)
* path 字符串
path.isAbsolute()用于判断path是不是一个绝对路径

如果path是一个空字符串,返回false

在POSIX
```javascript
path.isAbsolute('/foo/bar');  // true
path.isAbsolute('/foo/..');  // true
path.isAbsolute('foo/');  // false
path.isAbsolute('.');  // false
```

在windows上
```javascript
path.isAbsolute('//server')    // true
path.isAbsolute('\\\\server')  // true
path.isAbsolute('C:/foo/..')   // true
path.isAbsolute('C:\\foo\\..') // true
path.isAbsolute('bar\\baz')    // false
path.isAbsolute('bar/baz')     // false
path.isAbsolute('.')           // false
```
如果path不是一个字符串将会你抛出TypeError的错误

## path.join([...path])
* ...path 路径序列

path.join()将给与的各个路径参数使用平台特定的路径分割符连接在一起, 返回一个格式化的路径
参数中的空字符串所表示的路径将会被忽略,如果给定的参数是一个空字符串,则.将会背返回,表示当前文件夹

例如：
```javascript
path.join('/foo', 'bar', 'baz/asdf', 'quux', '..')
// returns '/foo/bar/baz/asdf'

path.join('foo', {}, 'bar')
// throws TypeError: path.join 的参数鼻血是字符串类型的
```
如果path不是一个字符串将会你抛出TypeError的错误

## path.normalize(path)
* path 字符串
path.normalize()对给定的path进行格式化

当一个path中连续出现多个路径分割符的时候(例如POSIX是/,windows上是\)。它们将会被单个系统默认的分隔符代替,末尾的分隔符将会背保留。
如果给定的参数是一个空字符串,则.将会背返回,表示当前文件夹

例如：在POSIX上
```javascript
path.normalize('/foo/bar//baz/asdf/quux/..')
// returns '/foo/bar/baz/asdf'
```
在windows上
```javascript
path.normalize('C:\\temp\\\\foo\\bar\\..\\');
// returns 'C:\\temp\\foo\\'
```
如果path不是一个字符串将会你抛出TypeError的错误

## path.parse(path)
* path 字符串
path.parse()返回一个对象, 各个属性分别表示路径的各个部分

返回的对象包含如下的几种属性：
* root 字符串
* dir 字符串
* base 字符串
* ext 字符串
* name 字符串

如：在POSIX上
```javascript
path.parse('/home/user/dir/file.txt')
// returns
// {
//    root : "/",
//    dir : "/home/user/dir",
//    base : "file.txt",
//    ext : ".txt",
//    name : "file"
// }
```
在windows上：
```javascript
path.parse('C:\\path\\dir\\file.txt')
// returns
// {
//    root : "C:\\",
//    dir : "C:\\path\\dir",
//    base : "file.txt",
//    ext : ".txt",
//    name : "file"
// }
```
如果path不是一个字符串将会你抛出TypeError的错误

## path.posix
path.posix提供了一个获取POSIX平台上path方法的具体实现

## path.relative(from, to)
* from 字符串
* to 字符串

path.relative()方法返回的是from到to的一个相对路径,如果from和to解析后代表的是相同的路径,将返回一个空字符串

如果一个空字符串被传递给了from或者to,则会默认使用当前的文件夹

例如：在POSIX上
```javascript
path.relative('/data/orandea/test/aaa', '/data/orandea/impl/bbb')
// returns '../../impl/bbb'
```
在windows上：
```javascript
path.relative('C:\\orandea\\test\\aaa', 'C:\\orandea\\impl\\bbb')
// returns '..\\..\\impl\\bbb'
```
如果path不是一个字符串将会你抛出TypeError的错误

## path.resolve([...paths])
* ...path 路径序列

path.resolve()这个方法将路径序列转化成绝对路径返回

路径序列将会按照从右向左的顺序依次解析,下面的路径将会被添加到当前路径的前面,知道一个绝对路径被构建出来,例如,有以下的路径：
/foo, /bar, baz,调用path.resolve('/foo', '/bar', 'baz');将返回/bar/baz

如果处理完全部的路径参数,但是没有绝对路径被返回的时候,当前文件夹路径将会被返回

这个方法返回的路径是一个格式化之后的路径,结尾的路径分割符将会被去除,除非解析之后的路径是根路径

空字符串路径将会被忽略

如果无路径被传递,则会返回当前文件夹所在的绝对路径

例如：

```javascript
path.resolve('/foo/bar', './baz')
// returns '/foo/bar/baz'

path.resolve('/foo/bar', '/tmp/file/')
// returns '/tmp/file'

path.resolve('wwwroot', 'static_files/png/', '../gif/image.gif')
// 如果当前文件夹所在的路径是s /home/myself/node,
// this returns '/home/myself/node/wwwroot/static_files/gif/image.gif'
```
如果path不是一个字符串将会你抛出TypeError的错误

## path.seq
提供操作系统特定的路径分割符
* \ windows
* / POSIX

在POSIX上：
```javascript
'foo/bar/baz'.split(path.sep)
// returns ['foo', 'bar', 'baz']
```
在window上
```javascript
'foo\\bar\\baz'.split(path.sep)
// returns ['foo', 'bar', 'baz']
```

## path.win32
path.win32提供了一个获取windows平台上path方法的具体实现

注意：在windows平台上/和\都是合法的路径分割符; 但是只有\会出现在返回值中
