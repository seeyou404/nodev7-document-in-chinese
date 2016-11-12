const http = require('http');

var server = http.createServer((req, res) => {
  res.writeHead(200, {
    'Content-Type':'text/html'
  })
  res.end('okay');
})

server.on('checkExpectation', () => {
  console.log('get Expectation');
})

server.listen(8080, () => {
  var options = {
    port:8080,
    hostname:'localhost',
    headers:{
      Expect:'100-continue'
    }
  }

  var req = http.request(options);
  req.end();
})
