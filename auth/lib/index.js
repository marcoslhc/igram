hmac = require('crypto').createHmac;

signedHeader = function (ip) {
	var pen, signature;
	

	pen = hmac('SHA256', config.auth.instagram['CLIENT_SECRET']);
	signature = pen.update(ip).digest('hex');
	
	return {
		'X-Insta-Forwarded-For': [ip, signature].join('|')
	}
}

module.exports = {
	signedHeader: signedHeader
}