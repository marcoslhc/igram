sprintf = require('sprintf');
website = {
		URL: 'http://127.0.0.1',
		PORT: '3000',
		getURL: function() {
			return sprintf('%(URL)s:%(PORT)s', this)
		}
}
gulp = {
	static: {
		styles: {
			sources:[
				'static/less/*.less'
			],
			destination: 'static/css/'
		}
	}
}
auth = {
	instagram: {
		'CLIENT_ID': process.env.INSTAGRAM_CLIENT_ID ||  '',
		'CLIENT_SECRET': process.env.INSTAGRAM_CLIENT_SECRET || '',
		'WEBSITE_URL': website.getURL,
		'REDIRECT_URI': website.getURL
	}
}
config = {
	website: website,
	gulp: gulp,
	auth: auth
}
module.exports = config;