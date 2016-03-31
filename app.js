var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var signedCookieParser = cookieParser('mychat');
var expressSession = require('express-session');
var MongoStore = require('connect-mongo')(expressSession);
var sessionStore = new MongoStore({url: 'mongodb://127.0.0.1/mychat'});

var routes = require('./routes/index');
var users = require('./routes/users');
var port = process.env.PORT | 3000;
var app = express();

//设置模板文件的存放路径
app.set('views', path.join(__dirname, 'views'));
// 设置模板引擎
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'app')));

app.use(expressSession({
    secret: 'mychat',
    resave: true,
    saveUninitialized: false,
    cookie: {
        maxAge: 60 * 60 * 1000
    },
    store: sessionStore
}));

//前端控制路由
app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

var server = app.listen(port);

var users = [];
var io = require('socket.io')(server);
io.set('authorization', function (request, next) {
    signedCookieParser(request, {}, function (err) {
        sessionStore.get(request.signedCookies['connect.sid'], function (err, sessoin) {
            if (err) {
                next(err.message, false);
            }
            else {
                if (sessoin && session.userId) {
                    request.session = sessoin;
                    next(null, true);
                } else {
                    next('no login');
                }
            }
        });
    })
});

var SYSTEM = {
    name: '系统',
    avatarUrl: 'https://secure.gravatar.com/avatar/50d11d6a57cfd40e0878c8ac307f3e01?s=48'
}

var User = require('./controllers/user');
var ObjectId = require('mongoose').Schema.ObjectId;

io.on('connection', function (socket) {
    var userId = socket.request.session.userId;
    var currentUser;
    User.findById({_id: userId}, function (err, user) {
        if (err) {
            currentUser = {username: '匿名'};
        }
        else {
            currentUser = user;
            users.push(currentUser);
            socket.broadcast.emit('message.add', {
                content: currentUser.username + '进入聊天室',
                creator: SYSTEM,
                createAt: new Date()
            });
            socket.on('disconnect', function () {
                socket.broadcast().emit('message.add', {
                    content: currentUser.username + '离开了聊天室',
                    creator: SYSTEM,
                    createAt: new Date()
                });
            });
            socket.emit('connected');
        }
    });

    socket.on('sendMessage', function (message) {
        message.push(message);
        io.sockets.emit('message.add', message);
    });

    socket.on('getAllMessages', function () {
        socket.emit('allMessages', {messages: messages, users: users})
    });

    socket.on('join', function (me) {

    });

    socket.on('leave', function (me) {
        if (me) {
            users = users.filter(function (user) {
                if (user)
                    return me._id != user._id;
            })
        }
    })
});



























