/**
 * Created by Administrator on 2017/8/15.
 */

var express = require('express');
var router = express.Router();
var Category = require('../models/Category');
var Content = require('../models/Content');
var markdown = require( "markdown" ).markdown;
var fs=require('fs');

var data;

/**
 * 处理通用的数据
 */
router.use(function (req, res, next) {
    data = {
        userInfo: req.userInfo,
        category: req.query.category || '',
        categories: []
    };

    Category.find().then(function (categories) {
        data.categories = categories;
        next();
    });

});

/**
 * 首页
 */
router.get('/', function (req, res, next) {

    if(req.session.sign){
        console.log(req.session);
        console.log(req.session.name+'欢迎再次登录');
    }else{
        req.session.sign=true;
        req.session.name='汇智网';
        console.log('欢迎登录');
    }

    data.contents = [];
    data.page = Number(req.query.page || 1);
    data.limit = 10;
    data.pages = 0;
    data.count = 0;

    var where = {};
    if (data.category) {
        where.category = data.category;
    }
    //查询所有分类
    Content.where(where).count().then(function (count) {
        data.count = count;
        data.pages = Math.ceil(data.count / data.limit);
        data.page = Math.min(data.page, data.pages);
        data.page = Math.max(data.page, 1);
        var skip = (data.page - 1) * data.limit;

        return Content.where(where).find().sort({addTime: -1}).limit(data.limit).skip(skip).populate(["category", "user"]);
    }).then(function (contents) {

        data.contents = contents;
        res.render('main/index', data);
    });
});

/**
 * 内容详情页
 */
router.get('/view', function (req, res) {
    Content.findOne({
        _id: req.query.contentid
    }).populate(["user"]).then(function (content) {
        data.content = content;

        content.views++;
        content.save();

        res.render('main/view', data);
    })
});

router.get('/mk', function (req, res) {
    fs.readFile('./test/test.md', 'utf-8', function (err, data) {
        if (err) {
            console.log(err);
        } else {
            var html =  markdown.toHTML(data) ;
            console.log(html);
            res.send(html)
            res.end();
        }
    });

});


module.exports = router;