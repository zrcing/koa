
var http = require('http');
var koa = require('..');
var app = koa();

// x-response-time

app.use(function *(){
  console.log('response time');
  var start = new Date;
  yield 'next';
  console.log('response time end');
  var ms = new Date - start;
  this.set('X-Response-Time', ms + 'ms');
});

// logger

app.use(function *(){
  console.log('<< %s', this.url);
  yield 'next';
  console.log('>> %s %s', this.url, this.status);
});

// response

app.use(function *(){
  console.log('response');
  yield 'next';
  console.log('response end');
  if ('/' != this.url) return;
  this.status = 200;
  this.body = 'Hello World\n';
});

app.listen(3000);