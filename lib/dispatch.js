
/**
 * Module dependencies.
 */

// TODO: this would become koa-compose
// TODO: wont need this
var co = require('co');

/**
 * Dispatch helper.
 */

module.exports = function(arr, ctx, fn) {
  new Dispatcher(arr, ctx).start(fn);
};

/**
 * Initialize a new Dispatcher with the given
 * `arr` of middleware and `ctx` object.
 *
 * @param {Array} arr
 * @param {Object} [ctx]
 * @api public
 */

function Dispatcher(arr, ctx) {
  this.gens = Array(arr.length);
  this.ctx = ctx || global;
  this.arr = arr;
  this.i = 0;
}

/**
 * Start dispatch.
 *
 * @param {Function} fn
 * @api private
 */

Dispatcher.prototype.start = function(fn){
  this.downstream(fn);
};

/**
 * Execute middleware downstream.
 *
 * @param {Function} fn
 * @api private
 */

Dispatcher.prototype.downstream = function(fn){
  var self = this;
  var i = this.i;
  var genfn = this.arr[i];

  // back upstream
  if (!genfn) return this.upstream(fn);
  this.i++;

  // resume
  var gen = genfn.call(this.ctx);
  this.gens[i] = gen;

  function resume(err, val) {
    var ret = gen.next(val);
    if (ret.done) return fn();
    if ('next' == ret.value) return self.downstream(resume);
    toThunk(ret.value)(resume);
  }

  resume();
};

/**
 * Execute middleware downstream.
 *
 * @param {Function} fn
 * @api private
 */

Dispatcher.prototype.upstream = function(fn){
  var self = this;
  var gen = this.gens[this.i--];

  // done
  if (!gen) return fn();

  // resume
  function resume(err, val) {
    var ret = gen.next(val);
    if (ret.done) return self.upstream(fn);
    toThunk(ret.value)(resume);
  }

  resume();
};

/**
 * Turn `obj` into a thunk.
 *
 * @param {Object} obj
 * @return {Function}
 * @api public
 */

function toThunk(obj, ctx) {
  var fn = obj;
  
  // array
  // TODO: move from co
  if (Array.isArray(obj)) return co.join.call(ctx, obj);
  
  // gen fun
  if (isGeneratorFunction(obj)) {
    var d = new Dispatcher([obj], ctx);
    return function(done){
      d.start(done);
    }
  }

  // TODO:
  // if (isGenerator(obj)) fn = function(done){ co(obj, done, ctx) };
  
  // promises
  if (isPromise(obj)) return promiseToThunk(obj);
  
  return fn;
}

/**
 * Convert `promise` to a thunk.
 *
 * @param {Object} promise
 * @return {Function}
 * @api private
 */

function promiseToThunk(promise) {
  return function(fn){
    promise.then(function(res) {
      fn(null, res);
    }, fn);
  }
}

/**
 * Check if `obj` is a promise.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isPromise(obj) {
  return obj && 'function' == typeof obj.then;
}

/**
 * Check if `fn` is a generator.
 *
 * @param {Mixed} obj
 * @return {Boolean}
 * @api private
 */

function isGenerator(obj) {
  return obj && '[object Generator]' == toString.call(obj);
}

/**
 * Check if `fn` is a generator function.
 *
 * @param {Mixed} obj
 * @return {Boolean}
 * @api private
 */

function isGeneratorFunction(obj) {
  return obj && obj.constructor && 'GeneratorFunction' == obj.constructor.name;
}