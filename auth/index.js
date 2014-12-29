var config = require('../config.js'),
	urllib = require('urllib'),
	sprintf = require('sprintf'),
	hmac = require('crypto').createHmac;


signed_header = function (ip) {
	var pen, signature;
	

	pen = hmac('SHA256', config.auth.instagram['CLIENT_SECRET']);
	signature = pen.update(ip).digest('hex');
	
	return {
		'X-Insta-Forwarded-For': [ip, signature].join('|')
	}
}


auth = function *() {
	var code = this.request.query.code,
		error = this.request.error,
		client_ip = this.request.headers['X-Forwarded-For'] || config.website.URL;

	if (error || !code) return;

	data = yield urllib.request(config.auth.instagram.endpoint,{
		method:'POST',
		headers: signed_header(client_ip),
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
		redirect = sprintf('%(URL)s#access_token=%(CODE)s', {
			URL: config.website.getURL(),
			CODE: responseData.access_token
		});
		this.redirect(redirect);
	};
}

module.exports = auth