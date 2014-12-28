var gulp = require('gulp'),
	less = require('gulp-less'),
	autoprefixer = require('gulp-autoprefixer'),
	config = {
		static: {
			styles: {
				sources:[
					'static/less/*.less'
				],
				destination: 'static/css/'
			}
		}
	};

gulp.task('styles', function () {
	var source = config['static']['styles']['sources'],
		dest = config['static']['styles']['destination'];

	gulp.src(source)
	.pipe(less())
	.pipe(autoprefixer())
	.pipe(gulp.dest(dest));
});

gulp.task('default',['styles']);