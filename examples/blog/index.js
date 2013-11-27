
/**
 * Module dependencies.
 */

var render = require('./lib/render');
var logger = require('koa-logger');
var route = require('koa-route');
var views = require('co-views');
var koa = require('../..');
var app = koa();

// "database"

var posts = [];

// middleware

app.use(logger());

// route middleware

app.use(route.get('/', list));
app.use(route.get('/post/:id', show));
app.use(route.post('/post', create));

// route definitions

/**
 * Post listing.
 */

function *list() {
  this.body = yield render('posts', { posts: posts });
}

/**
 * Show post :id.
 */

function *show(id) {

}

/**
 * Create a post.
 */

function *create() {

}

// listen

app.listen(3000);
