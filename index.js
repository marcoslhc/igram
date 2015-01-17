var app, api,
	koa = require('koa'),
	serve = require('koa-static'),
	cors = require('koa-cors'),
	config = require('./config.js')
	mount = require('koa-mount'),
	logger = require('koa-logger'),
	auth = require('./auth'),
	urllib = require('urllib');


app = koa();
api = koa();

if(config.debug) {
	app.use(logger());
}

app.use(cors());
api.use(function *(next) {
	var url = this.request.url;


	results = yield urllib.request('https://api.instagram.com' + url);
	this.body = results.data.toString();

	yield next;
});
app.use(mount('/auth', auth));
app.use(mount('/api', api));
app.use(serve(__dirname + '/views'))
app.use(serve(__dirname + '/static'));
app.use(serve(__dirname + '/bower_components'));
app.listen(3000);
