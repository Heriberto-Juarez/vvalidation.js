const gulp = require('gulp');
const concat = require("gulp-concat");
const terser = require("gulp-terser");
const sass = require("gulp-sass");
sass.compiler = require("node-sass");
const cleanCSS = require("gulp-clean-css");

const src = './src/';
const dest = './dist/';

gulp.task("minify:js", async () => {
    compress_js(gulp.src(src + "js/*.js").pipe(concat("VValidation.min.js")));
});

gulp.task('watch', async () => {
    gulp.watch(src + 'js/*.js', gulp.parallel('minify:js'));
});

function compress_js(e) {
    e.pipe(gulp.dest(dest + "js"))
        .pipe(terser())
        .pipe(gulp.dest(dest + "js"))
}