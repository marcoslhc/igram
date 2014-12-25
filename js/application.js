+function (window, document) {
	var loadHandler, getJSON, QueryString, igram_oauth_qs, EventTarget,
		extend,
		IGRAM_CLIENT_ID = 'dbb576b3e12342a496f0348020197da2',
		IGRAM_REDIRECT_URI = 'http://127.0.0.1:8000/',
		IGRAM_RESPONSE_TYPE = 'token',
		IGRAM_OAUT_URI = 'https://instagram.com/oauth/authorize',
		IGRAM_;

	extend = function(obj) {
		var source, prop, i, len;
		

		if (typeof obj !== 'object') {
			return obj;
		}
		
		for (i = 1, len = arguments.length; i < len; i++) {
			source = arguments[i];
			for (prop in source) {
				if (hasOwnProperty.call(source, prop)) {
					obj[prop] = source[prop];
				}
			}
		}

		return obj;
	};

	inherit = function(obj) {
		var source;


		if (typeof obj !== 'object') {
			return obj;
		}

		for (i = 1, len = arguments.length; i < len; i++) {
			source = arguments[i];
			extend(obj, source);
			extend(obj.prototype, source.prototype);
		}

		return obj;
	}

	QueryString = function (params, persist) {


		this.params		= params || {};
		this.initial	= params;
		this.persists	= persist ? true : false;

		return this;
	};

	extend(QueryString.prototype, {
		build: function () {
			var i,
			counter = 0,
			qstring = "?";


			if (Object.keys(this.params).length <= 0) {
				return "";
			}

			for (i in this.params) {
				if (counter !== 0) {
					qstring += "&";
				}
				qstring += i + "=" + encodeURIComponent(this.params[i]);
				counter++;
			}

			this.reset();

			return qstring;
		},

		reset: function (initial) {


			if (!this.persists) {
				this.params = {};
			} else {
				this.params = this.initial;
			}

			return this;
		},

		addParam: function (param, value) {
			var key;


			if (typeof param === 'object') {
				key = Object.keys(param)[0];
				value = param[key];
				param = key;
			}

			this.params[param] = value;

			return this;
		},

		removeParam: function (param) {
			delete this.params[param];

			return this;
		},

		setParam: function (param, value, swPersists) {
			var key;


			if (typeof param === 'object') {
				swPersists = value;
				key = Object.keys(param)[0];
				value = param[key];
				param = key;
			}

			this.params[param] = value;
			swPersists = swPersists ? !this.persists : this.persists;

			if (!swPersists) {
				this.initial[param] = value;
			}

			return this;

		}
	});

	EventTarget = {
		_listeners: {},

		on: function (type, listener) {
			if (typeof this._listeners[type] === 'undefined') {
				this._listeners[type] = [];
			}

			this._listeners[type].push(listener);
		},

		off: function (type, listener) {
			var listener, i, len;


			if (this._listeners[type] instanceof Array) {
				listeners = this._listeners[type];

				for (i=0, len = listeners.length; i < len; i++) {
					if(listeners[i].toString() === listener.toString()) {
						listeners.splice(i, 1);

						break;	
					}
				}
			}
		},

		trigger: function (event) {
			var listeners, i, len, event;


			if (typeof event === 'string') {
				event = {type: event};
			}

			if (!event.target) {
				event.target = this;
			}

			if (this._listeners[event.type] instanceof Array) {
				listeners = this._listeners[event.type];

				for (i = 0, len = listeners.length; i < len; i++) {
					listeners[i].call(this, event);
				}
			}
		}

	}

	Collection = function (options) {
		options = options || {};
		this.uri = options.uri || '';
		this.comparator =  options.comparator || '';

		return this;
	}

	extend(Collection.prototype, EventTarget, {
		sync :function () {
			getJSON(this.uri, function (data) {
				this.models = data;
				this.trigger('load');
			}, function (e) {
				throw new Error(e);
			});
		},

		get : function (value) {

		},

		where: function(attr, value) {

		},

		sort :function() {

		},

		fetch: function() {

		}
	});

	View = function (options) {
		return this;
	}

	extend(View.prototype, EventTarget, {
		render: function () {}
	});

	getJSON = function(url, successHandler, errorHandler) {
		var xhr = typeof XMLHttpRequest != 'undefined'
			? new XMLHttpRequest()
			: new ActiveXObject('Microsoft.XMLHTTP');


		xhr.open('get', url, true);
		xhr.onreadystatechange = function() {
			var status,data;


		// http://xhr.spec.whatwg.org/#dom-xmlhttprequest-readystate
			if (xhr.readyState == 4) { // `DONE`
				status = xhr.status;

				if (status == 200) {
					data = JSON.parse(xhr.responseText);
					successHandler && successHandler(data);
				} else {
					errorHandler && errorHandler(status);
				}
			}
		};
  		xhr.send();
	};

	loadHandler = function () {
		if ((hash = window.location.hash)) {
			tokInfo = hash.split('#')[1].split('=');
			window.localStorage[tokInfo[0]] = tokInfo[1];

			qs = new QueryString({
				'access_token': window.localStorage['access_token'],
				'client_id': IGRAM_CLIENT_ID
			});

			collection = new Collection({
				uri: 'https://api.instagram.com/v1/media/popular' + qs.build()
			});

			collection.on('load', function (e) {
				console.log(e.target.models)
			});

			collection.sync();
		} else {
			igram_oauth_qs = new QueryString({},true);
			
			igram_oauth_qs
			.setParam('client_id', IGRAM_CLIENT_ID)
			.setParam('redirect_uri', IGRAM_REDIRECT_URI)
			.setParam('response_type', IGRAM_RESPONSE_TYPE)

			link = document.getElementById('authLink');
			link.href = IGRAM_OAUT_URI + igram_oauth_qs.build();
		}
	}



	document.addEventListener('DOMContentLoaded', loadHandler);

}(window, document);