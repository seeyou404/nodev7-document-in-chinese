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
