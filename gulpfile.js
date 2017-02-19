'use strict'

const browserify = require('browserify')
const gulp = require('gulp')
const source = require('vinyl-source-stream')
const uglify = require('gulp-uglify')
const buffer = require('vinyl-buffer')
const gutil = require('gulp-util')
const serve = require('gulp-serve')
const sass = require('gulp-sass')

const errorHandler = function (err) {
  gutil.log('Error', gutil.colors.red(err))
  gutil.beep()
}

const bundler = (options) => browserify(
  Object.assign({
    entries: ['client/main.js'],
    debug: false,
    transform: ['babelify'],
    extensions: ['.jsx']
  }, options)
)

const buildStyles = (entry) => {
  return gulp.src(entry)
  .pipe(sass().on('error', sass.logError))
  .pipe(gulp.dest('./docs'))
}

const bundle = (bundler, outputSource) => {
  bundler
    .bundle()
    .on('error', errorHandler)
    .pipe(source('main.js'))
    .pipe(gulp.dest('./docs'))
}

gulp.task('build', function () {
  bundler()
    .bundle()
    .pipe(source('main.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest('./docs'))
})

gulp.task('styles', function () {
  return buildStyles('./styles/main.scss')
})

gulp.task('styles:watch', ['styles'], function () {
  return gulp.watch('./styles/*.scss', ['styles'])
})

gulp.task('watch', ['styles:watch'], () => {
  const b = bundler({
    plugin: ['watchify'],
    cache: {},
    packageCache: {}
  })

  b.on('update', () => bundle(b))

  b.on('log', (log) => gutil.log(`main.js: ${log}`))

  bundle(b)
})

gulp.task('serve', serve({
  root: ['docs'],
  port: 9090
}))
