/**
 * Created by Administrator on 2017/8/15.
 * 应用程序的启动（入口）文件
 */

//加载express模块
var express = require('express');
//加载模板处理模块
var swig = require('swig');
//加载数据库模块
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
//加载session模块
var session = require('express-session');
//加载cookies模块
var Cookies = require('cookies');
//加载body-parser模块处理post提交的数据
var bodyParser = require('body-parser');
//创建app应用 => NodeJS Http.createServer();
var app = express();
//引入user模块
var User = require('./models/User');

var markdown = require("markdown").markdown;

//设置静态文件托管
//当用户访问的url以/public开始，那么直接返回对应__dirname + '/public' 下的文件
app.use('/public', express.static(__dirname + '/public'));

//配置应用模板
//定义当前应用所使用的模板引擎
//第一个参数：模板引擎的名称，同时也是模板文件的后缀，第二个参数表示用于解析处理模板内容的方法
app.engine('html', swig.renderFile);
//设置模板文件存放的目录，第一个参数必须是views,第二个参数是目录
app.set('views', './views');
//注册所使用的模板引擎，第一个参数必须是view engine，第二个参数和app.engine这个方法中定义的模板引擎的名称
// （第一个参数）是一致的
app.set('view engine', 'html');


//在开发过程中，需要取消模板缓存
swig.setDefaults({cache: false});

//bodyparser设置
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
    secret: 'hubwiz app',
    cookie: {maxAge: 3 * 1000}//毫秒
}));

//设置cookie
app.use(function (req, res, next) {
    req.cookies = new Cookies(req, res);
    //设置为全局对象，方便使用,解析用户登录的信息
    req.userInfo = {};

    if (req.cookies.get('userInfo')) {
        try {
            req.userInfo = JSON.parse(req.cookies.get('userInfo'));

            User.findById(req.userInfo._id).then(function (userInfo) {
                req.userInfo.isAdmin = Boolean(userInfo.isAdmin);
                next();
            });
        } catch (e) {
            next();
        }
    } else {
        next();
    }


});

/**
 * 根据不同的功能划分模块
 */
app.use('/admin', require('./routers/admin'));
app.use('/api', require('./routers/api'));
app.use('/', require('./routers/main'));


// /**
//  * 首页
//  * req request对象
//  * res response对象
//  * next 执行函数
//  */
// app.get('/', function (req, res, next) {
//     //res.send('<h1>欢迎光临我的博客！</h1>');
//
//     /**
//      * 读取views目录下的指定文件，解析并返回给客户端
//      * 第一个参数：表示模板的文件，相对于views目录
//      * 第二个参数：传递给模板使用的数据
//      */
//
//     res.render('index');
//
// });
//
// app.get('/main.css', function (req, res, next) {
//     res.setHeader('content-type', 'text/css;charset=utf-8');
//     res.send('body{background:red}');
// });


//监听http请求
mongoose.connect('mongodb://localhost:27018/blog', {useMongoClient: true}, function (err) {
    if (err) {
        console.log('数据库连接失败');
    } else {
        console.log('数据库连接成功');
        app.listen(8081);
    }
});
