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
// ----------------- Paths -----------------
// ----------------- Paths -----------------
const paths = {
    html: {
        src: 'components/index.html',     // <-- ПРАВИЛЬНИЙ ШЛЯХ
        watch: 'components/**/*.html',  // <-- Стежимо за всіма HTML в 'components'
        dest: 'dist'
    },
    styles: {
        src: 'components/scss/style.scss',
        watch: 'components/scss/**/*.scss',
        dest: 'dist/css'
    },
    scripts: {
        src: 'components/js/script.js', // <-- Я побачив 'script.js' на скріншоті
        watch: 'components/js/**/*.js', // <-- (Ви можете змінити це, якщо потрібно)
        dest: 'dist/js'
    },
    images: {
        src: 'components/images/**/*',
        dest: 'dist/images'
    },
    favicon: {
        src: 'components/favicon.ico', // <-- ПРАВИЛЬНИЙ ШЛЯХ
        dest: 'dist'
    },
    bootstrap: {
        css: 'node_modules/bootstrap/dist/css/bootstrap.min.css',
        js: 'node_modules/bootstrap/dist/js/bootstrap.bundle.min.js'
    }
};
// ----------------- Clean -----------------
const clean = () => del(['dist']);

// ----------------- Bootstrap copy -----------------
const copyBootstrapCSS = () => {
    return src(paths.bootstrap.css)
        .pipe(dest(paths.styles.dest));
};
const copyBootstrapJS = () => {
    return src(paths.bootstrap.js)
        .pipe(dest(paths.scripts.dest));
};
const copyBootstrap = parallel(copyBootstrapCSS, copyBootstrapJS);//паралельно запускаю таски

// ----------------- HTML -----------------
const html = () => {
    return src(paths.html.src)
        .pipe(fileInclude({
            prefix: '@@',
            basepath: '@root' // <-- ПЕРЕВІРТЕ ЦЕ
        }))
        .pipe(dest(paths.html.dest))
        .pipe(browserSync.stream());
};

// ----------------- Styles -----------------
// ----------------- Styles -----------------
const styles = () => {
    return src(paths.styles.src)
        .pipe(sass().on('error', sass.logError))
        .pipe(cssnano())
        .pipe(rename({ basename: 'index', suffix: '.min' })) // <-- ЗМІНЕНО
        .pipe(dest(paths.styles.dest))
        .pipe(browserSync.stream());
};

// ----------------- Scripts -----------------
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

// ----------------- Images -----------------
const images = () => {
    return src(paths.images.src)
        .pipe(imagemin())
        .pipe(dest(paths.images.dest));
};

// ----------------- Favicon -----------------
const favicon = () => {
    return src(paths.favicon.src, { allowEmpty: true })
        .pipe(dest(paths.favicon.dest));
};

// ----------------- Server -----------------
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

// ----------------- Watcher -----------------
const watcher = () => {
    watch(paths.html.watch, html);
    watch(paths.styles.watch, styles);
    watch(paths.scripts.src, scripts);
    watch(paths.images.src, images);
};

// ----------------- Exports -----------------
exports.clean = clean;
exports.bootstrap = copyBootstrap;
exports.html = html;
exports.styles = styles;
exports.scripts = scripts;
exports.images = images;
exports.favicon = favicon;

exports.default = series(
    clean,

    copyBootstrap,
    parallel(html, styles, scripts, images, favicon),
    serve,
    watcher
);
