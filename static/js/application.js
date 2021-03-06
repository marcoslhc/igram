'use strict';
+(function (window, factory) {
	window.app = factory($, window.async);
}(window, function ($, async) {
	var result, makeTemplate, loadHandler, getJSON, QueryString,
		IgramOauthQS, Events, request,
		extend, build, Collection, View,
		IGRAM_CLIENT_ID = 'dbb576b3e12342a496f0348020197da2',
		IGRAM_REDIRECT_URI = 'http://127.0.0.1:3000/auth',
		IGRAM_RESPONSE_TYPE = 'code',
		IGRAM_OAUT_URI = 'https://instagram.com/oauth/authorize';

	extend = function extend(obj) {
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

	build = function build(protoProps, staticProps) {
		var child, Surrogate,
			parent = this;

		if (protoProps && protoProps.hasOwnProperty('constructor')) {
			child = protoProps.constructor;
		} else {
			child = function () {
				return parent.apply(this, arguments);
			};
		}

		extend(child, parent, staticProps);

		Surrogate = function Surrogate() {
			this.constructor = child;
		};

		Surrogate.prototype = parent.prototype;
		child.prototype = new Surrogate();

		if (protoProps) {
			extend(child.prototype, protoProps);
		}

		child.__super__ = parent.prototype;

		return child;
	};

	result = function result(obj, prop) {
		var value;


		if (!obj || !prop) {
			return void 0;
		}

		value = obj[prop];

		return typeof value === 'function' ? obj[prop]() : value;
	};

	makeTemplate = function makeTemplate(tmpl) {
		var interpolation = /\{\{([^{}]*)\}\}/g;

		return function (obj) {
			return tmpl.replace(interpolation,
				function (a, b) {
					var r, matches, tmpObj, key;

					if (!!~b.indexOf('.')) {
						matches = b.split('.');
						tmpObj = obj;

						while (key = matches.shift()) {
							tmpObj && key && (tmpObj = tmpObj[key]);
						}

						r = tmpObj || '';
					} else {
						r = obj[b] || '';
					}

					return typeof r === 'string' || typeof r === 'number' ? r : a;
				}
			);
		};
	};

	QueryString = function QueryString(params, persist) {

		this.params		= params || {};
		this.initial	= params;
		this.persists	= persist ? true : false;

		return this;
	};

	extend(QueryString.prototype, {
		build: function build() {
			var i,
			counter = 0,
			qstring = '?';

			if (Object.keys(this.params).length <= 0) {
				return '';
			}

			for (i in this.params) {
				if (counter !== 0) {
					qstring += '&';
				}
				qstring += i + '=' + encodeURIComponent(this.params[i]);
				counter++;
			}

			this.reset();

			return qstring;
		},

		reset: function reset(initial) {

			if (!this.persists) {
				this.params = {};
			} else {
				this.params = this.initial;
			}

			return this;
		},

		addParam: function addParam(param, value) {
			var key;

			if (typeof param === 'object') {
				key = Object.keys(param)[0];
				value = param[key];
				param = key;
			}

			this.params[param] = value;

			return this;
		},

		removeParam: function removeParam(param) {
			delete this.params[param];

			return this;
		},

		setParam: function setParam(param, value, swPersists) {
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

	Events = {
		on: function on(name, listener, ctx) {
			var events;

			ctx || (ctx = this);
			ctx._listeners || (ctx._listeners =	{})
			events = ctx._listeners[name] || (ctx._listeners[name] = []);
			events.push({callback: listener, context: ctx});
		},

		off: function off(name, listener, ctx) {
			var listeners, i, len;

			ctx || (ctx = this);

			if(!ctx._listeners) {
				return;
			}

			if (ctx._listeners[name] instanceof Array) {
				listeners = ctx._listeners[name];

				for (i = 0, len = listeners.length; i < len; i++) {
					if (listeners[i].callback.toString() === listener.toString()) {
						listeners.splice(i, 1);

						break;
					}
				}
			}
		},

		trigger: function trigger(event, ctx) {
			var listeners, len,
				i = -1;

			if (!this._listeners) {
				return this;
			}
			if (typeof event === 'string') {
				event = {type: event};
			}

			if (this._listeners[event.type] instanceof Array) {
				listeners = this._listeners[event.type];
				len = listeners.length;

				while (++i < len) {
					listeners[i].context || (listeners[i].context = ctx);

					if (!event.target) {
						event.target = listeners[i].context;
					}

					listeners[i].callback.call(listeners[i].context, event);
				}
				return;
			}
		}

	};

	Collection = function Collection(options) {
		options = options || {};
		this.models = [];
		this.uri = options.uri || '';
		this.comparator =  options.comparator || '';
		extend(this, options);
	};

	extend(Collection.prototype, Events, {
		sync: function sync() {
		},

		get: function get(value) {},

		where: function where(attr, value) {

		},

		sort:function sort() {
			var comparatorFunc;

			comparatorFunc = function comparatorFunc(a, b) {
				return (b[this.comparator] - a[this.comparator]);
			};
			this.models.sort(comparatorFunc.bind(this));
			return this;
		},

		fetch: function fetch() {

		}
	});

	View = function View(options) {
		this.makeElement();
		this.build = build.bind(this);
		if (this.templateUrl) {
			var self = this;
			request(this.templateUrl, function (templateText) {
				self.template = makeTemplate(templateText);
				self.render && self.render();
			});
		}
	};

	extend(View.prototype, Events, {
		tagName: 'div',
		render: function render() {},
		makeElement: function makeElement() {
			var elem, attr,
				attrs = extend({}, result(this, 'attributes'));


			if (this.id) {
				attrs.id = result(this, 'id');
			}

			if (this.class) {
				attrs['class'] = result(this, 'class');
			}

			elem = document.createElement(result(this, 'tagName'));

			for (attr in attrs) {
				elem.setAttribute(attr, attrs[attr]);
			}

			this.$el = $(elem);
			this.el = this.$el[0];
		},
		init: function init() {
			this._events();
		},
		_events: function _events() {
			var evts, evt, kys, key;

			if (!this.events) {
				return;
			}
			evts = this.events;
			kys = Object.keys(evts);
			while (key = kys.shift()) {
				evt = evts[key];
				this.on(key , evt);
			}
		}
	});

	Collection.build = View.build = build;

	request = function request(url, successHandler, errorHandler) {
		var xhr = typeof XMLHttpRequest !== 'undefined' ?
		new XMLHttpRequest() :
		new ActiveXObject('Microsoft.XMLHTTP');

		xhr.open('get', url, true);
		xhr.onreadystatechange = function() {
			var status, data;


			// http://xhr.spec.whatwg.org/#dom-xmlhttprequest-readystate
			if (+xhr.readyState === 4) { // `DONE`
				status = xhr.status;

				if (status === 200) {
					successHandler && successHandler(xhr.responseText);
				} else {
					errorHandler && errorHandler(status);
				}
			}
		};
		xhr.send();
	};

	getJSON = function getJSON(url, successHandler, errorHandler) {
		request(url, function (data) {
			data = JSON.parse(data);
			successHandler && successHandler(data);
		}, function (err) {
			errorHandler && errorHandler(err);
		});
	};

	loadHandler = function loadHandler() {
		var photoAlbum, tokInfo, hash, endPoints,
			renderView, generalParams, updateAlbum,
			link;


		if ((hash = '' + window.location.hash) || window.localStorage['igram_access_token']) {
			if (hash) {
				tokInfo = hash.split('#')[1].split('=')[1];
				window.localStorage['igram_access_token'] = '' + tokInfo;
			}
			endPoints = [
				{
					url:'http://127.0.0.1:3000/api/v1/media/search',
					params:{
						'lat':'26.105865599999998',
						'lng':'-80.3666672',
						'distance':'16000'
					}
				},
				{
					url:'http://127.0.0.1:3000/api/v1/media/search',
					params:{
						'lat':'41.3850640',
						'lng':'2.1734030',
						'distance':'16000'
					}
				},
				{
					url:'http://127.0.0.1:3000/api/v1/media/search',
					params:{
						'lat':'10.1579310',
						'lng':'-67.9972100',
						'distance':'16000'
					}
				},
				{
					url:'http://127.0.0.1:3000/api/v1/media/search',
					params:{
						'lat':'40.7127840',
						'lng':'-74.0059410',
						'distance':'16000'
					}
				}
			];

			generalParams = {
				'access_token': window.localStorage['igram_access_token'],
				'client_id': IGRAM_CLIENT_ID
			};

			photoAlbum = new Collection({
				'comparator': 'created_time'
			});

			updateAlbum = function updateAlbum(e) {
				photoAlbum.models = Array.prototype.concat.apply(
					photoAlbum.models, e.target.models
				);
				photoAlbum.sort();
			};

			window.elements = [];
			renderView = function renderView(e) {
				e.target.models.forEach(function (elm, idx) {
					var Photo, photo,
						column = '#column-' + ((parseInt(idx) % 4) + 1);

					Photo = View.build({
						templateUrl: 'views/' + elm.type + '.html',
						tagName: 'div',
						class: elm.type,
						render: function () {
							var video, button, buttonLabel,
								videoPlaying = false;

							this.$el
							.append(this.template(elm))
							.appendTo(column);

							if(this.class === 'video') {
								video = this.$el.find('video');
								button = this.$el.find('.play-stop');
								buttonLabel = this.$el.find('.play-stop span');

								video.on('playing', function () {
									videoPlaying = true;
								});
								video.on('ended', function () {
									videoPlaying = false;
									buttonLabel
									.toggleClass('fa-pause')
									.toggleClass('fa-play');
								});
								button.on('click', function (e) {
									e.preventDefault();

									if (videoPlaying) {
										video[0].pause();
										buttonLabel
										.toggleClass('fa-pause')
										.toggleClass('fa-play');
										videoPlaying = false;
										return;
									}

									buttonLabel
									.toggleClass('fa-play')
									.toggleClass('fa-pause');
									video[0].play();
								});
							}
						}

					});

					photo = new Photo();
				});
			};

			photoAlbum.on('load', renderView, photoAlbum);

			async.parallel(endPoints, function (elm, cb) {
				var qs, photos;

				extend(elm.params, generalParams);

				qs = new QueryString(elm.params);

				photos = new Collection({
					uri: (elm.url + qs.build()),
					sync: function sync() {
						var self = this;
						getJSON(self.uri, function (data) {
							self.models = data.data;
							self.trigger('load', self);
							cb();
						}, function (err) {
							cb(err);
						});
					}
				});

				photos.on('load', updateAlbum, photos);

				photos.sync();

			}, function () {
				photoAlbum.trigger('load');
			});
		} else {
			IgramOauthQS = new QueryString({}, true);

			IgramOauthQS
			.setParam('client_id', IGRAM_CLIENT_ID)
			.setParam('redirect_uri', IGRAM_REDIRECT_URI)
			.setParam('response_type', IGRAM_RESPONSE_TYPE);

			link = document.getElementById('authLink');
			link.href = IGRAM_OAUT_URI + IgramOauthQS.build();
		}
	};

	$(document).ready(loadHandler);

	return this;

}));
