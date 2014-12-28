+(function (window, factory){
	factory($);
}(window, function ($) {
	var loadHandler, getJSON, QueryString, igram_oauth_qs, Events,
		extend, build, Collection, View,
		IGRAM_CLIENT_ID = 'dbb576b3e12342a496f0348020197da2',
		IGRAM_REDIRECT_URI = 'http://127.0.0.1:3000/',
		IGRAM_RESPONSE_TYPE = 'token',
		IGRAM_OAUT_URI = 'https://instagram.com/oauth/authorize',
		IGRAM_;

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

		if(protoProps && protoProps.hasOwnProperty('constructor')) {
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
		child.prototype = new Surrogate;

		if (protoProps) {
			extend(child.prototype, protoProps);
		}

		child.__super__ = parent.prototype;

		return child;
	}

	result = function result(obj, prop) {
		var value;


		if (!obj || !prop) return void 0;

		value = obj[prop];

		return typeof value === 'function' ? obj[prop]() : value;
	}

	makeTemplate = function makeTemplate(tmpl) {
		var interpolation = /\{\{([^{}]*)\}\}/g;
		
		return function (obj) {
			return tmpl.replace(interpolation,
				function (a, b) {
					var r, matches, tmpObj, key;
					
					if (~b.indexOf(".")) {
						matches = b.split(".");
						tmpObj = obj;
						
						while (key = matches.shift()) {
							tmpObj && key && (tmpObj = tmpObj[key]);
						}
						
						r = tmpObj;
					} else {
						r = obj[b];
					}
					
					return typeof r === "string" || typeof r === "number" ? r : a;
				}
			);
		}
	}

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

		off: function off(name, listener) {
			var listener, i, len;


			if (this._listeners[name] instanceof Array) {
				listeners = this._listeners[name];

				for (i=0, len = listeners.length; i < len; i++) {
					if(listeners[i].callback.toString() === listener.callback.toString()) {
						listeners.splice(i, 1);

						break;	
					}
				}
			}
		},

		trigger: function trigger(event, ctx) {
			var listeners, i =-1, len, event;

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
					listeners[i].context = ctx || listeners[i].context;

					if (!event.target) {
						event.target = listeners[i].context;
					}

					listeners[i].callback.call(listeners[i].context, event);
				}
				return;
			}
		}

	}

	Collection = function Collection(options) {
		options = options || {};
		this.models = {};
		this.uri = options.uri || '';
		this.comparator =  options.comparator || '';
		extend(this, options);
	}

	extend(Collection.prototype, Events, {
		sync: function sync() {
			var self = this;
			getJSON(self.uri, function (data) {
				self.models = data.data;
				self.trigger('load', self);
			}, function (err) {
				throw new Error(err);
			});
		},

		build: build.bind(this),

		get : function get(value) {},

		where: function where(attr, value) {

		},

		sort :function sort() {

		},

		fetch: function fetch() {

		}
	});

	View = function View(options) {
		this.makeElement();
		this.build = build.bind(this);
	}

	extend(View.prototype, Events, {
		tagName: 'div',
		render: function render() {},
		makeElement: function makeElement() {
			var elem,
				attrs = extend({}, result(this, 'attributes'));


			if (this.id) attrs.id = result(this, 'id');

			if (this.class) attrs['class'] = result(this, 'class');

			elem = $('<' + result(this,'tagName') + '>').attr(attrs);
			this.$el = $(elem);
			this.el = this.$el[0];
		}
	});

	Collection.build = View.build = build;

	getJSON = function getJSON(url, successHandler, errorHandler) {
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

	loadHandler = function loadHandler() {
		var endPoints, renderView, generalParams;


		if ((hash = window.location.hash) || window.localStorage['access_token']) {
			if(hash) {
				tokInfo = hash.split('#')[1].split('=');
				window.localStorage[tokInfo[0]] = tokInfo[1];
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
				}
			];

			generalParams = {
				'access_token': window.localStorage['access_token'],
				'client_id': IGRAM_CLIENT_ID
			};
			renderView = function renderView(e) {
				e.target.models.forEach(function (elm, idx, lst) {
					var view,
						column = '#column-' + ((+idx%4)+1),
						type = elm.type[0].toUpperCase() + elm.type.slice(1),
						templateText = $('#igram'+ type +'Template').text();
					

					Photo = View.build({
						template: makeTemplate(templateText),
						tagName: 'div',
						className: elm.type,
						render: function () {
							var video, button,
								video_playing = false;


							this.$el
							.addClass(this.className)
							.append(this.template(elm))
							.appendTo(column);

							if(this.className == 'video') {
								video = this.$el.find('video')[0];
								button = this.$el.find('.play-stop span');

								$(video).on('playing', function () {
									video_playing = true;
								});
								$(video).on('ended', function () {
									video_playing = false;
									button
									.toggleClass('fa-pause')
									.toggleClass('fa-play');
								});
								this.$el.find('.play-stop').on('click', function (e) {
									e.preventDefault();

									if(video_playing) {
										video.pause();
										button
										.toggleClass('fa-play')
										.toggleClass('fa-pause');
										video_playing = false;
										return
									}

									button
									.toggleClass('fa-play')
									.toggleClass('fa-pause');
									video.play();
								})
							}
						}

					});

					photo = new Photo();
					photo.render();
				});
			}

			endPoints.forEach(function (elm, idx, lst) {
				var qs, collection;

				extend(elm.params, generalParams);

				qs = new QueryString(elm.params);

				photos = new Collection({
					uri: (elm.url + qs.build())
				});

				photos.on('load', renderView, photos);

				photos.sync();
			});
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



	$(document).ready(loadHandler);

}));