'use strict';

var gulp = require('gulp');
var sass = require('gulp-dart-sass');
// sass.compiler = require('node-sass');

function compileSass() {
    return gulp.src('./*.scss')
        .pipe(sass({ outputStyle: 'compressed', includePaths: 'node_modules' }).on("error", sass.logError))
        // .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./'))
        .on('error', function (e) { console.log(e) });
}
gulp.task('watch', function () {
    gulp.watch('./*.scss', compileSass);
});