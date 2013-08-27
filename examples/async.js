
var request = require('request');
var http = require('http');
var koa = require('..');
var app = koa();

// logger

app.use(function *(){
  var start = new Date;
  yield 'next';
  var ms = new Date - start;
  console.log('%s %s - %sms', this.method, this.url, ms);
});

// GET /

app.use(function *(){
  yield 'next';

  if ('/' != this.path) return;

  var a = yield get('http://google.com');
  var b = yield get('http://yahoo.com');
  var c = yield get('http://msn.com');

  this.body = 'got: ' + [a.statusCode, b.statusCode, c.statusCode].join(' ');
});

// GET /parallel

app.use(function *(){
  yield 'next';

  if ('/parallel' != this.path) return;

  var a = get('http://google.com');
  var b = get('http://yahoo.com');
  var c = get('http://msn.com');
  var res = yield [a, b, c];

  this.body = 'got: ' + [res[0].statusCode, res[1].statusCode, res[2].statusCode].join(' ');
});

app.listen(3000);

function get(url) {
  return function(done){
    console.log('GET %s', url);
    request(url, done);
  }
}