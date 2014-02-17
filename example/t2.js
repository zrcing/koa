var koa = require('koa');
var app = koa();

app.use(function *(){
	
	var s = yield aa();
	var b = yield bb();

	this.body = s+b;

});

function *aa() {
	return 'aa';
}

function *bb() {
	return 'bb';
}

app.listen(3000);