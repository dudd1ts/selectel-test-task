'use strict';

// Определим константу с папками
const dirs = {
  source: 'src',  // папка с исходниками (путь от корня проекта)
  build: 'build', // папка с результатом работы (путь от корня проекта)
};

// Определим необходимые инструменты
const gulp = require('gulp');
const gulpSequence = require('gulp-sequence');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const mqpacker = require('css-mqpacker');
const replace = require('gulp-replace');
const del = require('del');
const browserSync = require('browser-sync').create();
const ghPages = require('gulp-gh-pages');
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');
const uglify = require('gulp-uglify-es').default;
const concat = require('gulp-concat');
const notify = require('gulp-notify');
const plumber = require('gulp-plumber');
const cleanCSS = require('gulp-cleancss');
const pug = require('gulp-pug');
const wait = require('gulp-wait');
const htmlbeautify = require('gulp-html-beautify');
const stylus = require('gulp-stylus');
const babel = require('gulp-babel');

// Перечисление и настройки плагинов postCSS, которыми обрабатываются стилевые файлы
let postCssPlugins = [
  autoprefixer({                                           // автопрефиксирование
    browsers: ['last 2 version', 'ie 10'],
    grid: true,
  }),
  mqpacker({                                               // объединение медиавыражений с последующей их сортировкой
    sort: true
  })
];

// Изображения, которые нужно копировать
let images = [
  dirs.source + '/img/*.{gif,png,jpg,jpeg,svg,ico}',
  dirs.source + '/blocks/**/img/*.{gif,png,jpg,jpeg,svg}'
];

// Cписок обрабатываемых файлов в указанной последовательности
let jsList = [
  dirs.source + '/js/promise.polyfill.min.js',
  dirs.source + '/blocks/**/*.js',
  dirs.source + '/js/script.js'
];

// Компиляция и обработка стилей
gulp.task('style', function () {
  return gulp.src(dirs.source + '/styles/style.styl')        // какой файл компилировать
    .pipe(plumber({                                        // при ошибках не останавливаем автоматику сборки
      errorHandler: function(err) {
        notify.onError({
          title: 'Styles compilation error',
          message: err.message
        })(err);
        this.emit('end');
      }
    }))
    .pipe(wait(100))
    .pipe(sourcemaps.init())                               // инициируем карту кода
    .pipe(stylus())                                          // компилируем
    .pipe(postcss(postCssPlugins))                         // делаем постпроцессинг
    .pipe(sourcemaps.write('/'))                           // записываем карту кода как отдельный файл
    .pipe(gulp.dest(dirs.build + '/css/'))                 // записываем CSS-файл
    .pipe(browserSync.stream({match: '**/*.css'}))         // укажем browserSync необходимость обновить страницы в браузере
    .pipe(rename('style.min.css'))                         // переименовываем (сейчас запишем рядом то же самое, но минимизированное)
    .pipe(cleanCSS())                                      // сжимаем и оптимизируем
    .pipe(gulp.dest(dirs.build + '/css/'));                // записываем CSS-файл
});

// Копирование и обработка HTML (ВНИМАНИЕ: при совпадении имён Pug приоритетнее!)
gulp.task('html', function() {
  return gulp.src(dirs.source + '/*.html')
    .pipe(replace(/\n\s*<!--DEV[\s\S]+?-->/gm, ''))        // Убираем комменты для разработчиков
    .pipe(gulp.dest(dirs.build));
});

// Компиляция pug
gulp.task('pug', function() {
  return gulp.src([
      dirs.source + '/*.pug',
      '!' + dirs.source + '/mixins.pug',
    ])
    .pipe(plumber())
    .pipe(pug())
    .pipe(htmlbeautify())
    .pipe(gulp.dest(dirs.build));
});

// Копирование изображений
gulp.task('copy:img', function () {
  if(images.length) {
    return gulp.src(images)
      .pipe(rename({dirname: ''}))
      .pipe(gulp.dest(dirs.build + '/img'));
  }
  else {
    console.log('Изображения не обрабатываются.');
    callback();
  }
});

// Копирование шрифтов
gulp.task('copy:fonts', function () {
  return gulp.src([
      dirs.source + '/fonts/*.{ttf,woff,woff2,eot,svg}',
    ])
    .pipe(gulp.dest(dirs.build + '/fonts'));
});

// Ручная оптимизация изображений
// Использование: folder=src/img npm start img:opt
const folder = process.env.folder;
gulp.task('img:opt', function (callback) {
  if(folder){
    return gulp.src(folder + '/*.{jpg,jpeg,gif,png,svg}')
      .pipe(imagemin({
        progressive: true,
        svgoPlugins: [{removeViewBox: false}],
        use: [pngquant()]
      }))
      .pipe(gulp.dest(folder));
  }
  else {
    console.log('Не указана папка с картинками. Пример вызова команды: folder=src/blocks/test-block/img npm start img:opt');
    callback();
  }
});

// Очистка перед сборкой
gulp.task('clean', function () {
  return del([
    dirs.build + '/**/*',
    '!' + dirs.build + '/readme.md'
  ]);
});

// Конкатенация и минификация Javascript
gulp.task('js', function () {
  if(jsList.length) {
    return gulp.src(jsList)
      .pipe(plumber({ errorHandler: onError }))             // не останавливаем автоматику при ошибках
      .pipe(concat('script.min.js'))                        // конкатенируем все файлы в один с указанным именем
      .pipe(babel({presets: ['@babel/preset-env']}))        // полифилим
      .pipe(uglify())                                       // сжимаем
      .pipe(gulp.dest(dirs.build + '/js'));                 // записываем
  }
  else {
    console.log('Javascript не обрабатывается');
    callback();
  }
});

// Сборка всего
gulp.task('build', function (callback) {
  gulpSequence(
    'clean',
    ['style', 'js', 'copy:img', 'copy:fonts'],
    'html',
    'pug',
    callback
  );
});

// Задача по умолчанию
gulp.task('default', ['serve']);

// Локальный сервер, слежение
gulp.task('serve', ['build'], function() {
  browserSync.init({
    server: dirs.build,
    startPath: 'index.html',
    open: false,
    port: 8080,
  });
  // Слежение за стилями
  gulp.watch([
    dirs.source + '/styles/style.styl',
    dirs.source + '/styles/variables.styl',
    dirs.source + '/blocks/**/*.styl',
  ], ['style']);
  // Слежение за html
  gulp.watch([
    dirs.source + '/*.html',
  ], ['watch:html']);
  // Слежение за pug
  gulp.watch([
    dirs.source + '/**/*.pug',
  ], ['watch:pug']);
  // Слежение за изображениями
  if(images.length) {
    gulp.watch(images, ['watch:img']);
  }
  // Слежение за шрифтами
  gulp.watch(dirs.source + '/fonts/*.{ttf,woff,woff2,eot,svg}', ['watch:fonts']);
  // Слежение за JS
  if(jsList.length) {
    gulp.watch(jsList, ['watch:js']);
  }
});

// Браузерсинк
gulp.task('watch:html', ['html'], reload);
gulp.task('watch:pug', ['pug'], reload);
gulp.task('watch:img', ['copy:img'], reload);
gulp.task('watch:fonts', ['copy:fonts'], reload);
gulp.task('watch:js', ['js'], reload);

// Отправка в GH pages (ветку gh-pages репозитория)
gulp.task('deploy', function() {
  return gulp.src(dirs.build + '/**/*')
    .pipe(ghPages());
});

// Перезагрузка браузера
function reload (done) {
  browserSync.reload();
  done();
}

// Проверка существования файла/папки
function fileExist(path) {
  const fs = require('fs');
  try {
    fs.statSync(path);
  } catch(err) {
    return !(err && err.code === 'ENOENT');
  }
}

var onError = function(err) {
  notify.onError({
    title: 'Error in ' + err.plugin,
  })(err);
  this.emit('end');
};
