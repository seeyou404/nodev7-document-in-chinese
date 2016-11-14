* [HTTP](#)
  * [Class:http.Agent](#)
    * [new Agent([options])](#)
    * [agent.createConnection(optins[,callback])](#)
    * [agent.destroy](#)
    * [agent.freeSockets](#)
    * [agent.getName(options)](#)
    * [agent.maxFreeSockets](#)
    * [agent.maxSockets](#)
    * [agent.requests](#)
    * [agent.sockets](#)
  * [Class:http.ClientRequest](#)
    * [Event:'abort'](#)
    * [Event:'aborted'](#)
    * [Event:'connect'](#)
    * [Event:'continue'](#)
    * [Event:'response'](#)
    * [Event:'socket'](#)
    * [Event:'upgrade'](#)
    * [request.abort()](#)
    * [request.end([data][, encoding][, callback])](#)
    * [request.flushHeaders()](#)
    * [request.setNoDelay([noDelay])](#)
    * [request.setSocketKeepAlive([enable][, callback])](#)
    * [request.setTimeout(timeout[, callback])](#)
    * [request.write(chunk[, encoding][, callback])](#)
  * [Class:http.Server](#)
    * [Event:'checkContinue'](#)
    * [Event:'checkException'](#)
    * [Event:'clientError'](#)
    * [Event:'close'](#)
    * [Event:'connect'](#)
    * [Event:'connection'](#)
    * [Event:'request'](#)
    * [Event:'upgrade'](#)
    * [server.close([callback])](#)
    * [server.listen(handle[, callback])](#)
    * [server.listen(path[, callback])](#)
    * [server.listen([port][, hostname][, backlog][, callback])](#)
    * [server.listening](#)
    * [server.maxHeadersCount](#)
    * [server.setTimeout(msecs, callback)](#)
    * [server.timeout](#)
  * [Class: http.ServerResponse](#)
    * [Event: 'close'](#)
    * [Event: 'finish'](#)
    * [response.addTrailers(headers)](#)
    * [response.end([data][, encoding][, callback])](#)
    * [response.finished](#)
    * [response.getHeader(name)](#)
    * [response.headersSent](#)
    * [response.removeHeader(name)](#)
    * [response.sendDate](#)
    * [response.setHeader(name, value)](#)
    * [response.setTimeout(msecs, callback)](#)
    * [response.statusCode](#)
    * [response.statusMessage](#)
    * [response.write(chunk[, encoding][, callback])](#)
    * [response.writeContinue()](#)
    * [response.writeHead(statusCode[, statusMessage][, headers])](#)
 * [Class: http.IncomingMessage](#)
    * [Event: 'aborted'](#)
    * [Event: 'close'](#)
    * [message.destroy([error])](#)
    * [message.headers](#)
    * [message.httpVersion](#)
    * [message.method](#)
    * [message.rawHeaders](#)
    * [message.rawTrailers](#)
    * [message.setTimeout(msecs, callback)](#)
    * [message.statusCode](#)
    * [message.statusMessage](#)
    * [message.socket](#)
    * [message.trailers](#)
    * [message.url](#)
  * [http.METHODS](#)
  * [http.STATUS_CODES](#)
  * [http.createServer([requestListener])](#)
  * [http.get(options[, callback])](#)
  * [http.globalAgent](#)
  * [http.request(options[, callback])](#)

# HTTP
要使用http创建服务器或者客户端,须先引用`require('http')`;
nodejs的http接口主要被用于支持许多传统方式所不能使用的一些关于协议的特征。尤其被用于大的, 可能是块编码, 消息等。这个接口不会缓冲所有的请求和响应,用户可以以流的方式传递数据。
http的头部消息是一个对象,基本形式如下：
```javascript
{
  'content-length': '123',
  'content-type':'text/plain',
  'connection': 'keep-alive',
  'host': 'mysite.com',
  'accept': '*/*'
}
```
key的名称全部是小写的,value不允许被修改。
为了能够全范围的支持http应用,nodejs的http接口设计的非常低级,它只能进行流处理和数据的解析。
它能把解析的信息添加到http的头部或者主体中,但是不能够解析实际的http头部和消息体。

关于重复的消息头如何被处理请查看[message.headers](#)

原生的http头部信息被接收并保存在`rawHeaders`属性中,这个属性是一个数组,形式如[key1,value1,key2,value2,,,]。例如,先前的消息头对象可能有一个`rawHeaders`属性的形式如下：
```javascript
[
  'ConTent-Length', '123456',
  'content-LENGTH', '123',
  'content-type', 'text/plain',
  'CONNECTION', 'keep-alive',
  'Host', 'mysite.com',
  'accepT', '*/*'
]
```

## Class: http.Agent
http Agent被用于客户端请求的连接池中

httpAgent默认客户端的请求使用的是`Connection:keep-alive`。如果没有HTTP请求正在等待成为空闲的套接字的话，那么套接字将关闭。这意味着Node的资源池在负载的情况下对keep-alive有利，但是仍然不需要开发人员使用KeepAlive来手动关闭HTTP客户端。

如果你选择使用HTTP KeepAlive，那么你可以创建一个标志设为true的Agent对象。(见下面的[构造函数选项](#))。然后，Agent将会在资源池中保持未被使用的套接字，用于未来使用。它们将会被显式标记，以便于不保持Node进程的运行。但是当KeepAlive agent没有被使用时，显式地destroy() KeepAlive agent仍然是个好主意，这样套接字们会被关闭。

当套接字触发了close事件或者特殊的agentRemove事件的时候，套接字们从agent的资源池中移除。这意味着如果你打算保持一个HTTP请求长时间开启，并且不希望它保持在资源池中，那么你可以按照下列几行的代码做事：
```javascript
http.get(options, (res) => {
  // Do stuff
}).on('socket', (socket) => {
  socket.emit('agentRemove');
});
```
另外，你可以直接使用agent:false选择完全停用资源池。

```javascript
http.get({
  hostname: 'localhost',
  port: 80,
  path: '/',
  agent: false  // 仅仅为这个请求创建一个新的agent
}, (res) => {
  // 处理响应
});
```
## new Agent([options])
* `options` `{Object}` 设置于`agent`上的配置选项的集合。可以有下列字段：
  * `keepAlive` `{Boolean}` 保持在资源池周围套接未来字被其它请求使用。默认值为`false`
  * `keepAliveMsecs` `{Integer}` 当使用HTTP `KeepAlive`时, 通过正在被保持活跃的套接字来发送TCP `KeepAlive`包的频繁程度。默认值为1000。仅当`keepAlive`设置为true时有效。
  * `maxSockets` `{Number}` 每台主机允许的套接字的数目的最大值。默认值为`Infinity`。
  * `maxFreeSockets` 在空闲状态下还依然开启的套接字的最大值。仅当`keepAlive`设置为`true`的时候有效。默认值为256。

`http.request`所使用的`http.globalAgent`拥有上述全部使用默认值的各个属性

要配置这些属性, 你需要创建一个自己的`http.Agent`对象

```javascript
  const http = require('http');
  var keepAliveAgent = new http.Agent({keepAlive:true});
  options.agent = keepAliveAgent;
  http.request(options, responseFun);
```

## agent.createConnection(options[, callback])

* `options` `{object}` 包含连接的具体细节配置, 查看`net.createConnection()`了解选项的格式
* `callback` `{Function}` 接收到socket被创建时候的回调函数
* 返回`net.Socket`

产生一个socket流被用于http请求

默认情况下, 这个方法和`net.createConnection()`是相同的, 然而, 自定义的Agent可能会覆盖着个方法, 以便拥有更大的灵活性。

一个套接字(socket)/流(stream)可以通过以下两种方式之一被应用：通过这个方法返回一个套接字(socket)/流(stream), 或者通过向`callback`传递一个套接字(socket)/流(stream);

`callback`的参数形式是`(err, stream)`;

## agent.destroy()
销毁被此agent占用的任何套接字。

通常并不需要这样做。然而，当我们不会再用到一个保持连接的代理时，最好还是把它关掉。否则套接字在服务器结束他们之前仍会打开相当长的一段时间。

## agent.freeSockets
* `{Object}`
一个当使用http keepAlive时保存当前等待用于代理的数组对象。请不要修改

## agent.getName(options)
* `options` `{Object}` 提供生成名称信息的一组选项配置
  * `host` `{String}` 一个请求的服务器的域名或者ip地址
  * `port` `{Number}` 远程服务器的端口号
  * `localAddress` `{String}` 发送请求的时候绑定到网络连接的本地端口
* 返回值：`{String}`

通过设置请求选项获得一个独一无二的名称，来决定一个连接是否可以再生。在http代理中，它将返回`host:port:localAddress`。在https的代理中，这个 名称包含CA，cert,ciphers和其他HTTPS/TLS特殊选项来决定一个套接字是否可以再生。

## agent.maxFreeSockets
* `{Number}`
默认值是256，对于支持http KeepAlive的Agent，这设置了在空闲状态下仍然打开的套接字数目的最大值

## agent.maxSockets
* `{Number}`
默认设置为infinity。决定每台主机的agent可以拥有的并发套接字的打开的数量。主机是`host:port`或者`host:port:localAddress`的链接形式中的一种

## agent.requests
* `{Object}`
一个保存还没有指定套接字的请求队列对象。不要修改。

## agent.sockets
* `{Object}`
一个保存着当前被代理使用的套接字的数组对象。请不要修改。

# Class:http.ClientRequest
这个对象在内部创建，并由`http.request()`返回。它表示着一个正在处理的请求，其头部已经进入了请求队列。该头部仍然可以使用`setHeader(name, value)`,`getHeader(name)`,`removeHeader(name)`等API进行修改。实际的头部将会随着第一个数据块发送，或者在连接关闭时发送。

为了获得响应对象，给请求对象添加一个`response`监听器。当接收到响应头的时候，请求对象将会触发`response`。`response`事件执行时有一个参数，该参数是`http. IncomingMessage`的实例。在`response`事件期间，可以为响应对象添加事件监听器，尤其是`data`事件。

如果没有添加`response`处理函数，响应将会被完全忽略。然而，如果你添加了一个`response`事件处理函数，那么你必须消费掉响应对象的数据：可以在`readable`事件时调用`response.read()`，可以添加一个`data`处理函数，也可以调用`.resume()`方法。数据被消费掉之后，`end`事件被触发。如果数据为被读取，它将会消耗内存，最终产生`process out of memory`错误。

注意：Node不会检查Content-length和传输的body长度是否相同。

该请求实现了`Writeable Stream`接口。这是一哥包含下列事件的`EventEmitter`:

## Event:'abort'
当请求被客户端abort的时候触发，这个事件只会在第一次调用abort()的时候触发。

## Event:'aborted'
当请求被服务器端aborted和网络socket被关闭的时候触发。

## Event:'connect'
* `response` `{http.IncomingMessage}`
* `socket` `{net.Socket}`
* `head` `{Buffer}`

每当服务器使用`CONNECT`方法响应一个请时是被触发。如果该事件未被监听，接收`CONNECT`方法的客户端将关闭他们的连接。

下面是一对客户端/服务器代码，将向你展示如何监听connect事件。

```javascript
  const http = require('http');
  const net = require('net');
  const url = require('url');

  //创建一个http的隧道代理
  let proxy = http.createServer((req, res) => {
    res.writeHead(200, {'Content-Type':'text/plain'});
    res.end('okay');
  });

  proxy.on('connect', (req, cltSocket, head) => {
    //连接一个远程服务器
    let srvUrl = url.parse(`http://${req.url}`);
    let srvSocket = net.connect(srvUrl.port, srvUrl.hostname, () => {
      cltSocket.write('HTTP/1.1 200 Connection Established\r\n'+'Proxy-agent:Node.js-Proxy\r\n'+'\r\n');
      srvSocket.write(head);
      srvSocket.pipe(cltSocket);
      cltSocket.pipe(srvSocket);
    })
  })

  //运行代理
  proxy.listen(1337, '127.0.0.1', () => {
    //向隧道代理发送一个请求
    var options = {
      port: 1337,
      hostname: '127.0.0.1',
      method: 'CONNECT',
      path: 'www.google.com:80'
    };

    var req = http.request(options);
    req.end();

    req.on('connect', (res, socket, head) => {
      console.log('got connected');

      //通过http隧道发送一个请求
      socket.write('GET / HTTP/1.1\r\n' +
       'Host: www.google.com:80\r\n' +
       'Connection: close\r\n' +
       '\r\n');
      socket.on('data', (chunk) => {
        console.log(chunk.toString());
      })
      socket.on('end', () => {
        proxy.close();
      })
    })
  })
```

## Event:'continue'
当服务器发送`100 Continue`响应时触发，通常是应为请求包含`Expect:100-continue`。该指令表示客户端应该发送请求体。

## Event:'response'
* `response` `{http.IncomingMessage}`
当接收到请求的响应的时候触发，这个事件只会触发一次。

## Event:'socket'
* `socket` `{net.Socket}`
触发于一个套接字被赋予为这个请求的时候

## Event:'upgrade'
* `response` `{http.IncomingMessage}`
* `socket` `{net.Socket}`
* `head` `{Buffer}`

每当服务器返回`upgrade`响应时触发。如果该事件未被监听，客户端收到`upgrade`的时候将关闭连接。

下面的代码展示了如何监听`upgrade`事件。

```javascript
  const http = require('http');

  //创建一个http服务器
  var srv = http.createServer((req, res) => {
    res.writeHead(200, {'Content-Type':'text/plain'});
    res.end('okay');
  })

  //监听upgrade事件
  srv.on('upgrade', (req, socket, head) => {
    socket.write('HTTP/1.1 101 web Socket Protocol Handshake\r\n'+'Upgrade: WebSocket\r\n'+'Connection:Upgrade\r\n'+'\r\n');
    socket.pipe(socket);
  })
  //监听服务器
  srv.listen(1337, '127.0.0.1', () => {
    //创建一个请求
    var options = {
      port:1337,
      hostname:'127.0.0.1',
      headers:{
        'Connection':'upgrade',
        'upgrade':'websocket'
      }
    };

    var req = http.request(options);
    req.end();

    req.on('upgrade', (req, socket, upgradeHeader) => {
      console.log('connected');
      socket.end();
      process.exit(0);
    })
  })
```

## request.start()
用于终止一个请求。调用这个方法，会导致响应中的剩余数据会被删除，套接字也将被销毁。

## request.end([data][,encoding][,callback])
* `data` `{String|Buffer}`
* `encoding` `{String}`
* `callback` `{Function}`

结束发送的请求。如果请求体的某些部分还没有被发送，该函数会将它们flush到流中。如果请求是分块的，这个函数将会发送终结符0\r\n\r\n;

如果指定了`data`那么等价于先调用`request.write(data, encoding)`再调用`request.end()`;

如果`callback`被指定了，它将在请求流被完成的时候调用。

## request.flushHeaders()
flush请求头
有的时候因为效率的原因，nodejs通常缓冲请求头，直到你调用`request.end()`或者`write`第一个请求数据块的时候。那时，它视试图将请求头和数据放入到一个TCP数据包里面。

这通常就是你想要的(节省了TCP的往返时间)但是并不在第一个数据块被发送或更后面。`request.flushHeaders()`让你绕过优化后启动请求。

## request.setNoDelay([noDelay])
* `noDelay` `{Boolean}`
一旦一个套接字被分配给该请求并且完成连接，`socket.setNoDelay()`将会被调用。

## request.setSocketKeepAlive([enable][, initialDelay])
* `enable` `{Boolean}`
* `initialDelay` `{Number}`
一旦一个套接字被分配到这个请求，而且成功连接，那么`socket.setKeepAlive()`将会被调用。

## request.setTimeout(timeout[, callback])
* `timeout` `{Number}` 指定请求的超时时间
* `callback` `{Function}` 请求超时的回调函数，和`timeout`的事件处理器作用相同

返回`request`

## request.write(chunk[,encoding][,callback])
* `chunk` `{String | Buffer}`
* `encoding` `{String}`
* `callback` `{Function}`
发送一块请求体。调用该方法多次，用户可以流式地发送请求体至服务器--在这种情况下，创建请求时建议使用`Transfer-Encoding:chunked`
`chunk`参数必须是`Buffer`或者`String`
`encoding`参数是可选的，并且只能在`chunk`是`String`的时候才能设置，默认是`utf8`
`callback`参数也是可选的，当这个数据块被flush的时候调用。
返回`request`

# Class:http.Server
这个类继承自`net.Server`同时具有如下额外的事件

## Event:'checkContinue'
* `request` `{http.IncomingMessage}`
* `response` `{http.ServerResponse}`

每次接收到一个带有http头`Expect:100-continue`的时候触发。如果这个事件没有被监听，服务器将在适当的时机自动的响应`100 Continue`。

如果客户端应该继续发送请求体，处理这个事件需要调用`response.writeContinue()`方法。或者如果客户端不应该继续发送请求体，应该生成了一个合适的http响应(比如`400 Bad Request`)。

注意：当这个事件被触发的时候`request`事件是不会被触发的

## Event:'checkExpectation'
* `request` `{http.ClientRequest}`
* `response` `{http.ServerResponse}`

当收到一个具有http请求头`Expect`的时候触发，但是，值不能是`100-continue`。如果这个事件没有被监听，服务器将在恰当时机发送`417 Expectation Failed`的响应

注意：当这个事件被触发的时候`request`事件是不会被触发的

##Event:'clientError'
* `exception` `{Error}`
* `socket` `{net.Socket}`
如果一个客户端连接触发了一个`error`事件，它就会转到这里。这个事件的事件监听器负责关闭/销毁底层的套接字。例如，你希望通过响应`HTTP 400 Bad Request`来关闭套接字而不是突然的关闭。
对错误的请求的默认的行为就是突然的销毁套接字。
`socket`是导致错误的`net.Socket`对象。

```javascript
const http = require('http');
const server = http.createServer((req, res) => {
  res.end();
})

server.on('clientError', (err, socket) => {
  socket.end('HTTP/1.1 400 Bad Request');
})

server.listen(8000);
```
当`clientError`事件发生的时候，是不会有`request`和`response`对象的，所以任何的http响应被发送的时候，包括响应对象和payload必须被直接写入到`socket`对象。
必须注意响应消息是正确的响应格式的。

## Event:'close'
当服务器关闭的时候触发

## Event:'connect'
* `request` `{http.IncomingMessage}` 是HTTP请求的参数，与`request`事件中的相同。
* `socket` 是服务器和客户端之间的网络套接字
* `head` 是一个buffer实例，隧道流中的第一个包，该参数可能为空

每次客户端以HTTP `CONNECT`方法发送请求的时候触发。如果这个事件没有被监听，此时客户端将按照`CONNECT`请求方法，自有的连接方式关闭

在这个事件被分发后，请求的套接字将不会有`data`事件监听器，也就是说你将需要绑定一个监听器到`data`事件，来处理套接字被发送到服务器的数据。

## Event:'connection'
* `socket` `{net.Socket}`
新的TCP流建立的时候触发，`socket`是一个`net.Socket`对象。通常用户无需处理该事件。特别注意，协议解析器绑定套接字时采用的方式是套接字不会触发`readable`事件。还可以通过
`request.connection`来访问`socket`;

## Event:'request'
* `request` `{http.IncomingMessage}`
* `response` `{http.ServerResponse}`
每当接收到一个请求的时候触发，注意在每个连接中，可能会有多个请求发生(在保持连接的情况下)。

## Event:'upgrade'
* `request`是该http的请求参数，和`request`事件中的相同。
* `socket` 是服务器端和客户端之间的网络套接字
* `head` 是一个Buffer实例，升级后流的第一个包，这个参数可能为空

每当一个客户端请求http升级的时候触发，如果这个事件没有被监听，那么这些请求升级的客户端的连接将会被关闭

在这个事件被分发之后，请求的套接字将不会有data事件监听器，也就是说你将需要绑定一个监听器到data事件，来处理在套接字上被发送到服务器的数据。

## server.close([callback])
* `callback` `{Function}`
禁止服务端接收新的连接。查看`net.Server.close()`

## server.listen(handle[, callback])
* `handle` `{Object}`
* `callback` `{Function}`
`handle`变量可以被设置为server或者socket(任一以下划线开头的成员`_handle`)，或者一个`{fd:<n>}`对象。
这将使服务器指定的句柄接受连接，但它假设文件描述符或者句柄已经被绑定在特定的端口号或者域名套接字。

Windows不支持监听一个文件描述符。
这个函数是异步的。最后一个参数`callback`会被作为事件监听器添加到`listening`事件。另见`net.Server.listen()`。

返回的是一个`server`。

注意：`server.listen()`可能会被多次调用，每个后续调用将使用提供的选项重新打开服务器。


## server.listen(path[,callback])
* `path` `{String}`
* `callback` `{Function}`

启动一个 UNIX 套接字服务器在所给路径 `path` 上监听连接。

该函数是异步的.最后一个参数`callback`将会加入到`listening`事件的监听队列中。又见`net.Server.listen(path)`。

注意：`server.listen()`可能会被多次调用，每个后续调用将使用提供的选项重新打开服务器。

## server.listen([port][, hostname][, backlog][, callback])
* `port` `{Number}`
* `hostname` `{String}`
* `backlog` `{Number}`
* `callback` `{Function}`

开始在指定的主机名和端口接收连接。如果省略主机名，当IPV6是可获得时，这个服务器会接收任意IPV6(::)地址的连接。或者任一的IPv4(0.0.0.0)的连接。省略端口号则使用0。
如果操作系统指定了一个随机的端口号，我们可以在`listening`事件被触发之后，使用`server.address().port`来恢复。

监听一个unix socket，需要提供一个文件名而不是端口号和主机号。

积压量 backlog 为连接等待队列的最大长度。实际长度由您的操作系统通过 sysctl 设置决定，比如 Linux 上的 tcp_max_syn_backlog 和 somaxconn。该参数缺省值为 511（不是 512）。

这个函数是异步的。最后一个参数`callback`会被作为事件监听器添加到 `'listening'`事件。另见`net.Server.listen(port)`。

注意：`server.listen()`可能会被多次调用，每个后续调用将使用提供的选项重新打开服务器。

## server.listening
* `Boolean`
一个布尔值，指明服务器是否正在监听连接。

## server.maxHeadersCount
* `Number`
限制请求头的最大数量，默认是1000。设置为0表示没有限制。

## server.setTimeout(msecs, callback)
* `msecs` `{Number}`
* `callback` `{Function}`

为套接字设定超时值。如果一个超时发生，那么Server对象上会分发一个`'timeout'`事件，同时将套接字作为参数传递。

如果在Server对象上有一个`'timeout'`事件监听器，那么它将被调用，而超时的套接字会作为参数传递给这个监听器。

默认情况下，服务器的超时时间是2分钟，超时后套接字会自动销毁。 但是如果为`timeout`事件指定了回调函数，你需要负责处理套接字超时。

## server.timeout
* {Number} 默认是120000(2分钟)

一个套接字被判断为超时之前的闲置毫秒数。

注意套接字的超时逻辑在连接时被设定，所以更改这个值只会影响新创建的连接，而不会影响到现有连接。

设置为0将阻止之后建立的连接的一切自动超时行为。

# Class: http.ServerResponse
这是一个有http服务器内部创建的对象(不是用户自行创建的)，它将作为第二个参数传递到`request`事件中。

该响应实现了但不是继承`Writable stream`接口，这是一个包含下列事件的`EventEmitter`。

## event:'close'
需要注意的是底层连接在`response.end()`被调用或者可以冲洗掉之前就被终结了。

## event:'finish'
当响应被发送的时候触发。更具体的说，这个事件在响应头和主体的最后一部分被操作系统通过网络传输出去的时候触发。它并不意味着客户端已经接收到任何东西了。

这个事件之后，响应对象不会再触发其它的事件。

## response.addTrailers(headers)
* `headers` `{Object}`

这个方法添加HTTP尾随headers(一个在消息末尾的header)给响应。

只有当数据块编码被用于响应时尾随才会被触发，如果不是（例如：请示是http1.0）他们将会被自动丢弃。

需要注意的是如果要触发尾随消息，HTTP要求一个报文头场列表和Trailer报头一起发送，例如：

```javascript
  response.writeHead(200，{'content-type':'text/plain'，'Trailer':'Content-MD5'});
  response.write(filedata);
  response.addTrailers({'Content-MD5':'7895bf4b8828b55ceaf47747b4bca667'});
  response.end();
```
在设置头部字段的名称和值的时候，如果尝试添加非法的字符，将会抛出`TypeError`的错误。

## response.end([data][, encoding][, callback])
* `data` `{String | Buffer}`
* `encoding` `{String}`
* `callback` `{Function}`

当所有的响应报头和报文被发送完成时这个方法将信号发送给服务器；服务器会认为这个消息完成了。 每次响应完成之后必须调用该方法。

如果指定了参数 `data` , 就相当于先调用 `response.write(data, encoding)` 之后再调用 `response.end()`.

如果指定了参数`callback`, 将会在响应流结束的时候被调用 。

## response.finished
* `Boolean`
响应是不是已经完成,开始的时候是`false`,当`response.end()`执行之后,就为true。

## response.getHeader(name)
* `name` `{String}`
* `return` `{String}`

读取一个在队列中但是还没有被发送至客户端的header。需要注意的是 name 参数是不区分 大小写的。它只能在header还没被冲洗掉之前调用。

例如：
```javascript
  const contentType = response.getHeader('content-type');
```

## response.headersSent
* `Boolean`

布尔值(只读),true表示头部已经发送,false则表示没有发送。

## response.removeHeader(name)
* `name` `{String}`

取消掉一个在队列内等待发送的header。

例如：
```javascript
  response.removeHeader('Content-Encoding');
```

## response.sendDate
* `Boolean`

若为true,则当headers里没有Date值时自动生成Date并发送.默认值为true。
只有在测试环境才禁用它; 因为 HTTP 要求响应包含 Date 头。

## response.setHeader(name, value)
* `name` `{String}`
* `value` `{String}`

为默认或者已存在的头设置一条单独的头内容。如果这个头已经存在于 将被送出的头中，将会覆盖原来的内容。如果我想设置更多的头， 就使用一个相同名字的字符串数组。

例如：
```javascript
response.setHeader('Content-Type', 'text/html');
```
或者：
```javascript
response.setHeader('Set-Cookie', ['type=ninja', 'language=javascript']);
```
在设置头部字段的名称和值的时候，如果尝试添加非法的字符，将会抛出`TypeError`的错误。

通过`response.setHeader`设置的头部将会和传递给`response.writeHead()`方法的头部合并，且传递给`response.writeHead()`方法的头部具有更高的优先级。

```javascript
  // 返回content-type=text/plain
  const server = http.createServer((req,res) => {
    res.setHeader('Content-Type','text/html');
    res.setHeader('X-foo','bar');
    res.writeHead(200,{'Content-Type': 'text/plain'});
    res.end('ok');
  })
```

## response.setTimeout(msecs, callback)
* `msecs` `<Number>`
* `callback` `<Function>`

设定套接字的超时时间为`msecs`。如果提供了回调函数，会将其添加为响应对象的`'timeout'`事件的监听器。

如果请求、响应、服务器均未添加`'timeout'`事件监听，套接字将在超时时被销毁。 如果监听了请求、响应、服务器之一的`'timeout'`事件，需要自行处理超时的套接字。

返回的是`response`对象。

## response.statusCode
* `<Number>`

当使用默认`headers`时（没有显式地调用 `response.writeHead()` 来修改`headers`），这个属性决定`headers`更新时被传回客户端的HTTP状态码。

例如：
```javascript
response.statusCode = 404;
```
当响应头被发送回客户端，那么这个属性则表示已经被发送出去的状态码。

## response.statusMessage
* `String`

当使用默认`headers`时（没有显式地调用 `response.writeHead()` 来修改`headers`），这个属性决定`headers`更新时被传回客户端的HTTP状态信息。如果这个值是`undefined`，则状态码对应的标准信息将会被使用。

例如：
```javascript
response.statusMessage = 'Not found';
```
当响应头被发送回客户端，那么这个属性则表示已经被发送出去的状态信息。


## response.write(chunk[, encoding][, callback])
* `chunk`  `{String | Buffer}`
* `encoding` `{String}`
* `callback` `{Function}`
* 返回`Boolean`

如果这个方法被调用但是 `response.writeHead()` 没有被调用，它将切换到默认`header`模式并更新默认的`headers`。

它将发送一个响应体的数据块。这个方法可能被调用很多次以防止继承部分响应体。

`chunk`可以是字符串或者缓存。如果`chunk` 是一个字符串， 第二个参数表明如何将这个字符串编码为一个比特流。默认的 `encoding`是`'utf8'`。

*注意*: 这是底层的 HTTP 报文，高级的多部分报文编码无法使用。

当第一次 `response.write()` 被调用时，将会发送缓存的header信息和第一个报文给客户端。 第二次`response.write()`被调用时，Node假设你将发送数据流，然后分别地发送。这意味着响应 是缓存到第一次报文的数据块中。

如果所有数据被成功刷新到内核缓冲区，则返回`true`。如果所有或部分数据在用户内存里还处于队列中，则返回`false`。当缓冲区再次被释放时，`'drain'`事件会被分发。


## response.writeContinue()
向客户端发送`HTTP/1.1 100 Continue`信息，指示应该发送请求体。查看`server`的`checkContinue`事件获取更多的信息。

## response.writeHead(statusCode[, statusMessage][, headers])
* `statusCode` `{Number}`
* `statusMessage` `{String}`
* `headers` `{Object}`

向请求回复响应头. `statusCode`是一个三位是的HTTP状态码, 例如 `404`. 最后一个参数, `headers`, 是响应头的内容. 可以选择性的，把人类可读的‘原因短句’作为第二个参数。

例如：
```javascript
  var body = 'hello world';
  res.writeHead(200，{
    'content-length':Buffer.byteLength(body)，
    'Content-Type':'text/plain'
  })
```
这个方法只能在当前请求中使用一次，并且必须在`response.end()`之前调用。

如果你在调用这之前调用了`response.write()`或者 `response.end()` , 通过调用这个函数，并且 不明/容易混淆 的头将会被使用。

通过`response.setHeader`设置的头部将会和传递给`response.writeHead()`方法的头部合并，且传递给`response.writeHead()`方法的头部具有更高的优先级。

```javascript
  // 返回content-type=text/plain
  const server = http.createServer((req,res) => {
    res.setHeader('Content-Type','text/html');
    res.setHeader('X-foo','bar');
    res.writeHead(200,{'Content-Type': 'text/plain'});
    res.end('ok');
  })
```

注意：`Content-Length` 是以字节(`byte`)计，而不是以字符(`character`)计。之前的例子奏效的原因是字符串`'hello world'`只包含了单字节的字符。如果`body`包含了多字节编码的字符，就应当使用`Buffer.byteLength()`来确定在多字节字符编码情况下字符串的字节数。需要进一步说明的是`Node`不检查`Content-Lenth`属性和已传输的`body`长度是否吻合。

在设置头部字段的名称和值的时候，如果尝试添加非法的字符，将会抛出`TypeError`的错误。

# Class: http.IncomingMessage

一个 `IncomingMessage`对象是由 `http.Server`或`http.ClientRequest`创建的，并作为第一参数分别传递给`'request'`和`'response'` 事件。它也可以被用来访问应答的状态，头文件和数据。

它实现了 `Readable Stream` 接口以及以下额外的事件，方法和属性。

## Event:'aborted'
当请求被客户端终止或者网络socket被关闭的时候触发。

## Event:'close'
指示底层的连接已经被终止了，跟'end'一样，这个事件对于每个应答只会触发一次。

## message.destroy([error])
* `error` `{Error}`
在接收`IncomingMessage`的`socket`上调用`destroy()`。如果制定了`error`参数，则一个`error`事件会被触发，`error`就会作为参数传递给所有的事件监听器。

## message.headers
* `{Object}`
请求或者响应的头对象
头部信息以`key-value`的键值对的形式呈现。头部的名称是小写的。例如：
```javascript
// { 'user-agent': 'curl/7.22.0',
//   host: '127.0.0.1:8000',
//   accept: '*/*' }
console.log(request.headers);
```
重复的头部信息将通过下列的方式进行处理, 依据响应头的名称。
* 以下重复的头部会被丢弃` authorization`, `content-length`, `content-type`, `etag`, `expires`, `from`, `host`, `if-modified-since`, `if-unmodified-since`, `last-modified`, `location`, `max-forwards`, `proxy-authorization`, `referer`, `retry-after`, or `user-agent`
* `set-cookie`是一个数组,重复的回添加到数组中
* 其它头部将会以逗号连接

## message.httpVersion
* `String`
向服务器发送请求的时候,客户端将会发送http的版本,服务器向客户端进行响应的时候,也会发送http的版本到客户端。大概就是`1.1`或者`1.0`。

`message.httpVersionMajor`是版本号的第一个整数,`message.httpVersionMinor`是版本号的第二个整数。

## message.method
* `{String}`
*仅对从http.Server获得到的请求(request)有效.*
请求（`request`）方法如同一个只读的字符串，比如`‘GET’`、`‘DELETE’`。

## message.rawHeaders
* `{Array}`

接收到的原始请求/响应头字段列表。

注意键和值在同一个列表中，它并非一个元组列表。于是，偶数偏移量为键，奇数偏移量为对应的值。

头名称没有转换为小写，也没有合并重复的头。

```javascript
// [ 'user-agent',
//   'this is invalid because there can be only one',
//   'User-Agent',
//   'curl/7.22.0',
//   'Host',
//   '127.0.0.1:8000',
//   'ACCEPT',
//   '*/*' ]
console.log(request.rawHeaders);
```

## message.rawTrailers
* `{Array}`
接收到的原始的请求/响应尾部键和值，只在'end'事件时存在。

## message.setTimeout(msecs, callback)
* `msecs` `{Number}`
* `callback` `{Function}`

调用`message.connection.setTimeout(msecs, callback)`

返回`message`

## message.statusCode
* `{Number}`

*仅对从http.ClientRequest获得的响应(response)有效.*

## message.statusMessage
* `{String}`
*仅对从http.ClientRequest获得的响应(response)有效.*

http响应的状态信息--就是值原因短语。例如：`OK`或者`Server Error`;

## message.socket
* `{net.socket}`
与此连接(`connection`)关联的`net.Socket`对象.
通过`https`的支持，使用 `request.connection.verifyPeer()`方法和`request.connection.getPeerCertificate()`方法来得到客户端的身份信息。

## message.trailers
* `{Object}`
请求/响应的尾部对象，只在`'end'`事件时是存在的。

## message.url
仅对从`http.Server`获得到的请求(`request`)有效.

请求的URL字符串.它仅包含实际HTTP请求中所提供的URL.加入请求如下:

```javascript
GET /status?name=ryan HTTP/1.1\r\n
Accept: text/plain\r\n
\r\n
```
`request.url`是：
```javascript
'/status?name=ryan'
```
如果你想要将URL分解出来,你可以用`require('url').parse(request.url)`. 例如:
```javascript
node> require('url').parse('/status?name=ryan')
{ href: '/status?name=ryan',
  search: '?name=ryan',
  query: 'name=ryan',
  pathname: '/status' }
```

如果你想要提取出从请求字符串(query string)中的参数,你可以用require('querystring').parse函数, 或者将true作为第二个参数传递给require('url').parse. 例如:

```javascript
node> require('url').parse('/status?name=ryan', true)
{ href: '/status?name=ryan',
  search: '?name=ryan',
  query: { name: 'ryan' },
  pathname: '/status' }
```

## http.METHODS
* `{Array}`
被解析器支持的请求方法的列表。

## http.STATUS_CODES
* `{Object}`
http标准状态码以及简单描述的集合。比如：`http.STATUS_CODES[404] === 'Not Found'`。

## http.createServer([requestListener])
* 返回`http.Server`
返回的是`http.Server`的实例。
`requestListener`是一个函数,会自动添加到`request`事件上。

## http.get(options[, callback])
* `options` `{Object}`
* `callback` `{Function}`
* 返回`<http.ClientRequest>`
因为大部分的请求是没有报文体的GET请求，所以Node提供了这种便捷的方法。该方法与`http.request()`的唯一区别是它设置的是`GET`方法并自动调用`req.end()`。

`callback`将会传递一个单一的参数--`http.IncomingMessage`的实例。
比如：获取JSON的例子
```javascript
http.get('http://nodejs.org/dist/index.json', (res) => {
  const statusCode = res.statusCode;
  const contentType = res.headers['content-type'];

  let error;
  if (statusCode !== 200) {
    error = new Error(`Request Failed.\n` +
                      `Status Code: ${statusCode}`);
  } else if (!/^application\/json/.test(contentType)) {
    error = new Error(`Invalid content-type.\n` +
                      `Expected application/json but received ${contentType}`);
  }
  if (error) {
    console.log(error.message);
    // consume response data to free up memory
    res.resume();
    return;
  }

  res.setEncoding('utf8');
  let rawData = '';
  res.on('data', (chunk) => rawData += chunk);
  res.on('end', () => {
    try {
      let parsedData = JSON.parse(rawData);
      console.log(parsedData);
    } catch (e) {
      console.log(e.message);
    }
  });
}).on('error', (e) => {
  console.log(`Got error: ${e.message}`);
});
```
## http.globalAgent
* `{http.Agent}`
超全局的代理实例，是http客户端的默认请求。


## http.request(options[, callback])
* `options` `{Object}`
  * `protocol`:`String`使用的协议。默认`http`
  * `host`：`String`请求发送到的服务器的域名或IP地址。默认为'localhost'。
  * `hostname`：`String`用于支持url.parse()。hostname比host更好一些
  * `port`：`Number`远程服务器的端口。默认值为80。
  * `family`:`Number`当解析`host`和`hostname`的时候使用的ip地址。可以使用的值是`4`和`6`。如果未指定则`IPV4`和`IPV6`都可以被使用。
  * `localAddress`：`String`用于绑定网络连接的本地接口。
  * `socketPath`：`String`Unix域套接字（使用host:port或socketPath）
  * `method`：指定HTTP请求方法的字符串。默认为'GET'。
  * `path`：请求路径。默认为'/'。如果有查询字符串，则需要包含。例如'/index.html?page=12'。请求路径包含非法字符时抛出异常。目前，只否决空格，不过在未来可能改变。
  * `headers`：`{Object}`包含请求头的对象。
  * `auth`：用于计算认证头的基本认证，即'user:password'
  * `agent`:控制Agent的行为。当使用了一个Agent的时候，请求将默认为Connection: keep-alive。可能的值为：
    * `undefined（默认）`：在这个主机和端口上使用[全局Agent][]。
    * `Agent对象`：在Agent中显式使用passed。
    * `false`：在对Agent进行资源池的时候，选择停用连接，默认请求为：Connection: close。
  * `createConnection`:`{Function}`当不使用`agent`选项时，产生一个套接字/流用于请求的函数。这可以用来避免创建自定义代理类来覆盖默认的`createConnection`函数。
  * `timeout`:`{Int}`一个指定socket超时的数字(毫秒)。这将设置在套接字连接之前的超时时间。
* `callback`:`Function`
* 返回:`<http.ClientRequest>`

nodejs的每个服务器可以进行多个连接的请求，这个方法只能进行一个问题的请求。

可选的回调函数将会作为`response`事件的一次性事件监听器。

`http.request()` 返回一个 `http.ClientRequest`类的实例。`ClientRequest`实例是一个可写流对象。如果需要用`POST`请求上传一个文件的话，就将其写入到`ClientRequest`对象。

例如：
```javascript
var postData = querystring.stringify({
  'msg' : 'Hello World!'
});

var options = {
  hostname: 'www.google.com',
  port: 80,
  path: '/upload',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(postData)
  }
};

var req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    console.log(`BODY: ${chunk}`);
  });
  res.on('end', () => {
    console.log('No more data in response.');
  });
});

req.on('error', (e) => {
  console.log(`problem with request: ${e.message}`);
});

// write data to request body
req.write(postData);
req.end();
```

注意，例子里的`req.end()`被调用了。使用`http.request()`方法时都必须总是调用`req.end()`以表明这个请求已经完成，即使响应body里没有任何数据。

如果在请求期间发生错误（DNS解析、TCP级别的错误或实际HTTP解析错误），在返回的请求对象会触发一个'error'事件。

有一些特殊的头部应该注意。
* 发送 `'Connection: keep-alive'`将会告知Node保持连接直到下一个请求发送。
* 发送 `'Content-length'` 头将会禁用默认的 chunked 编码.
* 发送 `'Expect'`报头会立即发送请求报头. 通常当发送 `'Expect: 100-continue'`时，你会同时发送一个超时和监听继续的事件。 查看 RFC2616 第 8.2.3 章节获得更多信息。
* 发送一个授权报头将会覆盖使用 `auth` 选项来完成基本授权。
