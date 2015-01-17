var gulp = require('gulp'),
	less = require('gulp-less'),
	autoprefixer = require('gulp-autoprefixer'),
	config = require('./config.js')['gulp'];

gulp.task('styles', function () {
	var source = config['static']['styles']['sources'],
		dest = config['static']['styles']['destination'];

	gulp.src(source)
	.pipe(less())
	.pipe(autoprefixer())
	.pipe(gulp.dest(dest));
});

gulp.task('default',['styles']);
