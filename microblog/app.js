var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var ejs = require('ejs');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var settings = require('./settings');
var flash = require('connect-flash');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('.html', ejs.__express);
app.set('view engine', 'html');



// session
app.use(session({
  secret: settings.cookieSecret,
  store: new MongoStore({
    url: 'mongodb://localhost/microblog'
  })
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// flash闪回
app.use(flash());
app.use(function(req, res, next) {
  console.log('app.user local');
  res.locals.user = req.session.user;
  res.locals.post = req.session.post;
  var error = req.flash('error');
  res.locals.error = error.length ? error:null;

  var success = req.flash('success');
  res.locals.success = success.length ? success:null;
  next();
});

// 路由
app.use('/', indexRouter);
app.use('/users', usersRouter);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



module.exports = app;
