+(function (window, factory) {
	window.async = factory();
})(window, function () {
	only_once = function (fn) {
		var called = false;
		return function() {
			if(called) throw new Error();
			called = true;
			fn.apply(this, arguments);
		}
	}
	_each = function (arr, iterator) {
		for (var i = 0; i < arr.length; i++) {
			iterator(arr[i], i, arr);
		}
	}
	_eachLimit = function (limit) {
		return function(arr, iterator, callback) {
			callback || (callback = function() {});
			if (!arr.length || limit <=0) {
				return callback();
			}
			var completed = 0;
			var started = 0;
			var running = 0;

			(function replenish() {
				if (completed >= arr.length) {
					return callback();
				}
				while (running < limit && started < arr.length) {
					started += 1;
					running += 1;
					iterator(arr[started - 1], function (err) {
						if (err) {
							callback(err);
							callback = function () {}
						} else {
							completed += 1;
							running -=1;
							if (completed >= arr.length) {
								callback();
							} else {
								replenish();
							}
						}
					});
				}
			})();
		}
	}
	each = function (arr, iterator, callback) {
		callback ||  (callback = function() {});
		if (!arr.length) {
			return callback();
		}
		var completed = 0;
		_each(arr, function (x) {
			iterator(x, only_once(done));
		});
		function done(err) {
			if (err) {
				callback(err);
				callback = function () {};
			} else {
				completed += 1
				if (completed >= arr.length) {
					callback();
				}
			}
		}
	}
	eachSeries = function (arr, iterator, callback) {
		callback || (callback = function () {});
		if (!arr.length) {
			return callback();
		}
		var completed = 0;
		var iterate = function () {
			iterator(arr[completed], function(err) {
				if(err) {
					callback(err);
					callback = function () {};
				}
				else {
					completed += 1;
					if (completed >= arr.length) {
						callback();
					} else {
						iterate();
					}
				}
			});
		}
		iterate();
	}
	eachLimit = function(arr, limit, iterator, callback) {
		var fn;


		fn = _eachLimit(limit);
		fn.apply(null, [arr, iterator, callback]);
	}
	return {
		parallel: each,
		series: eachSeries,
		parallelLimit: eachLimit
	}
});