var app, api,
	koa = require('koa'),
	serve = require('koa-static'),
	cors = require('koa-cors'),
	mount = require('koa-mount'),
	logger = require('koa-logger'),
	urllib = require('urllib');


app = koa();
api = koa();

app.use(logger());
app.use(cors());
api.use(function *(next) {
	var url = this.request.url;
	

	results = yield urllib.request('https://api.instagram.com' + url);
	this.body = results.data.toString();

	yield next;
});
app.use(mount('/api', api));
app.use(serve(__dirname + '/static'));
app.use(serve(__dirname + '/bower_components'));
app.listen(3000);