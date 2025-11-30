const { src, dest, series, parallel, watch } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const cssnano = require('gulp-cssnano');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const imagemin = require('gulp-imagemin');
const browserSync = require('browser-sync').create();
const fileInclude = require('gulp-file-include');
const del = require('del');

// ----------------- Paths -----------------
const paths = {
    html: {
        src: 'components/index.html',
        watch: 'components/**/*.html',
        dest: 'dist'
    },
    styles: {
        src: 'components/scss/style.scss',
        watch: 'components/scss/**/*.scss',
        dest: 'dist/css'
    },
    scripts: {
        src: 'components/js/script.js',
        watch: 'components/js/**/*.js',
        dest: 'dist/js'
    },
    images: {
        src: 'components/images/**/*',
        dest: 'dist/images'
    },
    // НОВЕ: Шлях для JSON файлів
    data: {
        src: 'components/data/**/*.json',
        dest: 'dist/data'
    },
    favicon: {
        src: 'components/favicon.ico',
        dest: 'dist'
    },
    bootstrap: {
        css: 'node_modules/bootstrap/dist/css/bootstrap.min.css',
        js: 'node_modules/bootstrap/dist/js/bootstrap.bundle.min.js'
    }
};

// ----------------- Clean -----------------
const clean = () => del(['dist']);

// ----------------- Tasks -----------------

// Копіювання Bootstrap
const copyBootstrapCSS = () => src(paths.bootstrap.css).pipe(dest(paths.styles.dest));
const copyBootstrapJS = () => src(paths.bootstrap.js).pipe(dest(paths.scripts.dest));
const copyBootstrap = parallel(copyBootstrapCSS, copyBootstrapJS);

// НОВЕ: Копіювання JSON даних
const copyData = () => {
    return src(paths.data.src)
        .pipe(dest(paths.data.dest))
        .pipe(browserSync.stream());
};

// HTML
const html = () => {
    return src(paths.html.src)
        .pipe(fileInclude({
            prefix: '@@',
            basepath: '@root'
        }))
        .pipe(dest(paths.html.dest))
        .pipe(browserSync.stream());
};

// Styles
const styles = () => {
    return src(paths.styles.src)
        .pipe(sass().on('error', sass.logError))
        .pipe(cssnano())
        .pipe(rename({ basename: 'index', suffix: '.min' }))
        .pipe(dest(paths.styles.dest))
        .pipe(browserSync.stream());
};

// Scripts
const scripts = () => {
    return src(paths.scripts.src, { sourcemaps: false })
        .pipe(concat('main.min.js'))
        .pipe(uglify().on('error', function (e) {
            console.error(e.toString());
            this.emit('end');
        }))
        .pipe(dest(paths.scripts.dest))
        .pipe(browserSync.stream());
};

// Images
const images = () => {
    return src(paths.images.src)
        .pipe(imagemin())
        .pipe(dest(paths.images.dest));
};

// Favicon
const favicon = () => {
    return src(paths.favicon.src, { allowEmpty: true })
        .pipe(dest(paths.favicon.dest));
};

// Server
const serve = done => {
    browserSync.init({
        server: {
            baseDir: 'dist'
        },
        notify: false,
        port: 3000
    });
    done();
};

// Watcher (Оновлено для JSON)
const watcher = () => {
    watch(paths.html.watch, html);
    watch(paths.styles.watch, styles);
    watch(paths.scripts.src, scripts);
    watch(paths.images.src, images);
    watch(paths.data.src, copyData); // Стежимо за JSON
};

// Exports
exports.default = series(
    clean,
    copyBootstrap,
    parallel(html, styles, scripts, images, favicon, copyData), // Додано copyData
    serve,
    watcher
);