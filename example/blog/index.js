
/**
 * Module dependencies.
 */
var render = require('./lib/render');
var logger = require('koa-logger');
var route = require('koa-route');
var views = require('co-views');
var parse = require('co-body');
var koa = require('koa');

var post = require('./models/post.js');

var app = koa();

// "database"

var posts = [];

// middleware

app.use(logger());

// route middleware

app.use(route.get('/', list));
app.use(route.get('/post/new', add));
app.use(route.get('/post/:id', show));
app.use(route.post('/post', create));
app.use(route.get("/coTest", coTest));
app.use(route.get("/rbTest", rbTest));

// route definitions

function *list() {
  //this.body = yield render('list', { posts: posts });
  var a = yield post.getList('hello');
  var b = yield post.getData();
  var obj = new post({title:'title',content:'des'});
  var c =  yield obj.list();
  this.body = a+" "+b+c;
}

/**
 * Show creation form.
 */

function *add() {
  this.body = yield render('new');
}

/**
 * Show post :id.
 */

function *show(id) {
  var post = posts[id];
  if (!post) this.throw(404, 'invalid post id');
  this.body = yield render('show', { post: post });
}

/**
 * Create a post.
 */
function *create() {
  var post = yield parse(this);
  var id = posts.push(post) - 1;
  post.created_at = new Date;
  post.id = id;
  this.redirect('/');
}

var poolModule = require('generic-pool');
global.pool = poolModule.Pool({
    name: 'mysql',
    create: function(callback) {
        var mysql      = require('mysql');
        var c = mysql.createConnection({
            host     : '127.0.0.1',
            user     : 'root',
            password : 'root',
            port:3307,
            database:'infos'
        });
        c.connect();
        callback(null, c);
    },
    destroy  : function(client) { client.end(); },
    max      : 10,
    // optional. if you set this, make sure to drain() (see step 3)
    min      : 10,
    // specifies how long a resource can stay idle in pool before being removed
    idleTimeoutMillis : 30000,
    // if true, logs via console.log - can also be a function
    log : false
});
/*
global.pool.acquire(function(err, client) {
    if (err) {
    }
    else {
        client.query("select * from art", [], function(err, rows, fields) {
            // return object back to pool
            console.log('The solution is: ', rows[0].title);
            pool.release(client);
        });
    }
});
*/
function *rbTest() {
    var s = function s(sql){
        return function(fn){
            global.pool.acquire(function(err, client) {
                if (err) {
                }
                else {
                    client.query(sql, [], function(err, rows, fields) {
                        // return object back to pool
                        console.log('The solution is: ', rows[0].title);
                        pool.release(client);
                        fn(null, rows[0].title);
                    });
                }
            });
        }};
    var c = yield s("select * from art order by id desc");
    var d = yield s("select * from art");
    this.body = "rbTest "+c+" "+d;
}

//测试co 开始
var co = require('co');
var fs = require('fs');
function size(file) {
    return function(fn){
        fn(null, 'b');
    };
    /*
    return function(fn){
        fs.stat(file, function(err, stat){
            if (err) return fn(err);
            fn(null, stat.size);
        });
    }*/
};

var foo = co(function *(){
    var a = yield size('./index.js');
    var b = yield size('./index.js');
    var c = yield size('./nodemon.json');
    return [a, b, c];
});

var bar = co(function *(){
    var a = yield size('lib/render.js');
    var b = yield size('lib/render.js');
    var c = yield size('lib/render.js');
    return [a, b, c];
});
function *coTest() {

    //co(function *(){
        var a = yield foo;
        var b = yield bar;
        console.log(a);
        console.log(b);
   // })();
    this.body = "coTest";
}
//测试co 结束

// listen
app.listen(3000);
console.log('listening on port 3000');