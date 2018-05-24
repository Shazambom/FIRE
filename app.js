var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var session = require('express-session');
const crypto = require('crypto');

mongoose.connect('mongodb://localhost:27017/FIRE');

var indexRouter = require('./routes/index');
var checkTokenRouter = require('./routes/checkToken');
var loginRouter = require('./routes/login');
var submitArticleRouter = require('./routes/submitArticle');
var changeArticleCatRouter = require('./routes/changeArticleCategory');
var deleteArticleRouter = require('./routes/deleteArticle');
var getArticlesRouter = require('./routes/getArticles');
var productsRouter = require('./routes/products');
var stocksRouter = require('./routes/stocks');

var adminRouter = require('./routes/admin');


var app = express();
var mySession = session({
    secret: 'temp_secret',
    cookie: {maxAge : 600000, secure: false, rolling: true},
    genid: function (req) {
        return crypto.randomBytes(256).toString('hex');
    }
});

app.use(mySession);

// view engine setup
//app.use(express.static(path.join(__dirname, 'views')));
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/checkToken', checkTokenRouter);
app.use('/login', loginRouter);
app.use('/submitArticle', submitArticleRouter);
app.use('/changeArticleCategory', changeArticleCatRouter);
app.use('/deleteArticle', deleteArticleRouter);
app.use('/blog', getArticlesRouter);
app.use('/products', productsRouter);
app.use('/stocks', stocksRouter);



app.use('/admin', adminRouter);


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
