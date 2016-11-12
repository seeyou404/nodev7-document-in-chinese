const http = require('http');

var srv = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type':'text/plain'});
  res.end('okay');
})

//监听upgrade事件
srv.on('upgrade', (req, socket, head) => {
  console.log('the coming');
  socket.write('HTTP/1.1 101 Web Socket Protocol Handshake\r\n' +
               'Upgrade: WebSocket\r\n' +
               'Connection: Upgrade\r\n' +
               '\r\n');
  socket.pipe(socket);
})

//监听端口号
srv.listen(1337, '127.0.0.1', () => {
  //创建请求的选项
  var options = {
    port:1337,
    hostname:'127.0.0.1',
    headers:{
      'Connection':'upgrade',
      'upgrade':'websocket'
    }
  }

  var req = http.request(options);
  req.end('结束啦结束啦',() => {
    console.log('jijaija');
  });
  // req.abort();

  req.on('upgrade', (req, socket, upgradeHeader) => {
    console.log('got upgraded');
    socket.end();
    process.exit(0);
  })
})
