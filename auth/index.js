var config = require('../config.js'),
	urllib = require('urllib'),
	signedHeader = require('./lib').signedHeader;
	sprintf = require('sprintf');




auth = function *() {
	var code = this.request.query.code,
		error = this.request.error,
		client_ip = this.request.headers['X-Forwarded-For'] || config.website.URL;

	if (error || !code) return;

	data = yield urllib.request(config.auth.instagram.endpoint,{
		method:'POST',
		headers: signedHeader(client_ip),
		data: {
			client_id:config.auth.instagram['CLIENT_ID'],
			client_secret:config.auth.instagram['CLIENT_SECRET'],
			grant_type:'authorization_code',
			redirect_uri:config.website.getURL() + '/auth',
			code: code
		}
	});

	if (+data.status === 200) {
		responseData = JSON.parse(data.data.toString());
		this.body = {
			user: responseData.user
		};
		redirect = sprintf('%(URL)s#access_token=%(CODE)s', {
			URL: config.website.getURL(),
			CODE: responseData.access_token
		});
		this.redirect(redirect);
	};
}

module.exports = auth