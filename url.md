### 内容
* [URL](#)
  * [URL字符串和URL对象](#)
    * [urlObject.href](#)
    * [urlObject.protocol](#)
    * [urlObject.slashes](#)
    * [urlObject.host](#)
    * [urlObject.auth](#)
    * [urlObject.hostname](#)
    * [urlObject.port](#)
    * [urlObject.pathname](#)
    * [urlObject.search](#)
    * [urlObject.path](#)
    * [urlObject.query](#)
    * [urlObject.hash](#)
  * [url.format(urlObject)](#)
  * [url.parse(urlString[, parseQueryString[, slashesDenoteHost]])](#)
  * [url.resolve(from,to)](#)
  * [Escaped Character](#)

# URL
url模块提供了操作和解析url的实用工具和方法,可以通过如下的方式进行使用。
```javascript
const url = require('url');
```

## URL字符串和URL对象
结构化的URL字符串包含了很多具有丰富含义的组成部分。当被解析的时候,会返回一个属性中包含这些组成部分的对象。
下面这张图片是对解析后的url对象各个组成部分的细节展示。以'http://user:pass@host.com:8080/p/a/t/h?query=string#hash'为例

## urlObject.href
href属性就是完整的url字符串,解析后的url中的protocol和host都会被转换成小写的形式。
> 例如：'http://user:pass@host.com:8080/p/a/t/h?query=string#hash'

## urlObject.protocol
返回url的协议名称,小写的形式
> 例如：'http:'

## urlObject.slashes
布尔值,为true的时候表示协议的后面需要跟着两个/字符

## urlObject.host
host属性包含了url的主机部分,如果有端口号也会包含。小写形式
> 例如：'host.com:8080'

## urlObject.auth
auth指的是url的用户名和密码部分,有时候也被称之为'用户信息',这部分存在于协议和双/(如果存在)之后,主机部分之前,并且和主机通过@符号进行连接。基本的格式是: username:password而且:password是可选部分。

> 例如：'user:pass'

## urlObject.hostname
hostname以小写的形式呈现url的主机的部分,但是不包含端口号

> 例如：'host.com'

## urlObject.port
port属性指的是url的端口号部分

> 例如：'8080'

## urlObject.pathname
pathname属性包含了url的整个路径部分,也就是主机(包括端口号)后面的查询字符串和hash之前的所有的东西
> 例如：'/p/a/t/h'

注意：是不会对path字符串进行解码的

## urlObject.search
search包含了url的查询字符串部分,也会包含?
> 例如：'?query=string'

注意：是不会对path字符串进行解码的

## urlObject.path
path属性包含了url的pathname和search部分

> 例如：'/p/a/t/h?query=string'

注意：是不会对path字符串进行解码的

## urlObject.query
query属性指的是url中的search中不包含?的那部分,也可以指querystring的parse方法返回的对象

> 例如：'query=string'或者{'query':'string'}

如果返回的是一个字符串,是不会对查询字符串进行解码的。如果返回的是一个对象,键和值都是解码后的。

## urlObject.hash
hash属性返回的是url的hash值,包含#

> 例如：'#hash'

## url.format(urlObject)
* urlObject object | string 一个url对象(url.parse的返回值或者其它方式构造的),如果是一个字符串,会通过url.parse方法转化成对象。

url.format()会返回一个由urlObject转化而来的格式化的字符串

如果urlObject不是一个对象或者字符串,这个方法将会抛出一个TypeError错误。

格式化url主要经过以下几个过程：
* 一个空字符串result被创建
* 如果urlObject.protocol是一个字符串,其会被添加到result中
* 否则,如果urlObject.protocol不是undefined且不是一个字符串,抛出Error
* 对于字符串形式的urlObject.protocol,如果不是以：结尾的,则：会添加到result中去
* 如果urlObject.slashes为true,且urlObject.protocol是以http, https, ftp, gopher, 或者file之一开头,或者urlObject.protocol是undefined。则两个/ 将会被添加到result中去
* 如果urlObject.auth是true,同时urlObject.host和urlObject.hostname之一不是undefined。则urlObject.auth会被转化成一个字符串,同时拼接上符号@被添加到result中去
* 如果urlObject.host是undefined
  * 如果urlObject.hostname是一个字符串,添加到result中去
  * 否则,如果urlObject.hostname不是undefined且不是一个字符串,一个Error会被抛出
  * 如果urlObject.port的属性值可以被转化为true,同时urlObject.hostname不是undefined
   * :被添加到result中去
   * urlObject.port被强制转换成字符串并添加到result中去
* 否则,如果urlObject.host可以被转化成true,其会被强制性的转化成字符串并添加到result中
* 如果urlObject.pathname是一个非空的字符串
  * 如果urlObject.pathname不是以/开头,/会被添加到result中去
  * urlObject.pathname的值被添加到result中去
* 否则,如果urlObject.pathname的值不是undefined且不是一个字符串,一个Error会被抛出
* 如果urlObject.search属性是undefined同时urlObject.query是一个对象, ?会被添加到result中去, 同时会将urlObject.query传递给querystring模块的stringify方法, 并将结果添加到result中去
* 否则,如果urlObject.search是一个字符串
  * 如果urlObject.search不是以?开头,一个?字符将会被添加到result中去
  * urlObject.search的值被添加到result中去
* 否则,如果urlObject.search的值不是undefined且不是一个字符串,一个Error会被抛出
* 如果urlObject.hash是一个字符串
  * 如果urlObject.hash不是以#开头,一个#会被添加到result中去
  * urlObject.hash的值被添加到result中去
* 否则,如果urlObject.hash的值不是undefined且不是一个字符串,一个Error会被抛出
* 返回result

## url.parse(urlString[, parseQueryString[, slashesDenoteHost]])
* `urlString` 被解析的url字符串
* `parseQueryString`布尔值,如果为`true`,`query`属性会返回一个经过`querystring`模块的`parse`方法解析过的对象,如果为`false`则`query`属性会返回一个未经解码的字符串,默认是false
* `slashesDenoteHost`布尔值,如果为true则第一个//之后和下一个/之前的内容将会被解析为`host`,例如,`//foo/bar`的结果是{host:'foo',pathname:'bar'}而不是{pathname:'//foo/bar'}

这个方法的返回值是一个结果解析后的url对象

## url.resolve(from,to)
* `from`基url
* `to`被resolved的href
例如：
```javascript
url.resolve('/one/two/three', 'four')         // '/one/two/four'
url.resolve('http://example.com/', '/one')    // 'http://example.com/one'
url.resolve('http://example.com/one', '/two') // 'http://example.com/two'
```

## Escaped Characters
url只能允许包含一些合法的字符,空格和以下的字符在url中将会被自动转义
> < > " ` \r \n \t { } | \ ^ '

例如：空格会被转化成%20
/会被转化成%3C
