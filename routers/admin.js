/**
 * Created by Administrator on 2017/8/15.
 */


var express = require('express');
var router = express.Router();

var User = require('../models/User');
var Category = require('../models/Category');
var Content = require('../models/Content');

router.use(function (req, res, next) {
    if (!req.userInfo.isAdmin) {
        res.send('对不起，只有管理员才能进入后台');
        return;
    } else {
        next();
    }
});
/**
 * 后台首页
 */
router.get('/', function (req, res, next) {
    res.render('admin/index', {
        userInfo: req.userInfo
    });
});
/**
 * 用户管理列表
 */
router.get('/user', function (req, res, next) {
    /**
     *  数据库查找用户列表
     *
     *  分页查询
     *  limit(number):限制获取的数据条数
     *  skip（number）:忽略数据的条数
     */

    var page = Number(req.query.page || 1);
    var limit = 10;
    var pages = 0;

    User.count().then(function (count) {

        //计算总页数
        pages = Math.ceil(count / limit);
        //取值不能超过pages
        page = Math.min(page, pages);
        //取值不能小于1
        page = Math.max(page, 1);

        var skip = (page - 1) * limit;

        User.find().limit(limit).skip(skip).then(function (users) {
            res.render('admin/user_index', {
                userInfo: req.userInfo,
                users: users,
                page: page,
                count: count,
                pages: pages,
                limit: limit,
                url: '/admin/user'
            });
        });
    });
});
/**
 * 分类列表
 */
router.get('/category', function (req, res) {

    var page = Number(req.query.page || 1);
    var limit = 10;
    var pages = 0;
    Category.count().then(function (count) {
        pages = Math.ceil(count / limit);
        page = Math.min(page, pages);
        page = Math.max(page, 1);
        var skip = (page - 1) * limit;

        Category.find().sort({_id: -1}).limit(limit).skip(skip).then(function (categories) {
            res.render('admin/category_index', {
                userInfo: req.userInfo,
                categories: categories,
                page: page,
                count: count,
                pages: pages,
                limit: limit,
                url: '/admin/category'
            });
        });
    });
});
/**
 * 添加分类
 */
router.get('/category/add', function (req, res) {
    res.render('admin/category_add', {})
});
/**
 * 提交添加分类数据
 */
router.post('/category/add', function (req, res) {
    var name = req.body.name || '';
    if (name == '') {
        res.render('admin/error', {
            userInfo: req.userInfo,
            message: '内容不能为空'
        });
        return;
    }

    //查询数据库中是否存在该分类
    Category.findOne({
        name: name
    }).then(function (rs) {
        if (rs) {
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: '该分类已经存在'
            });
            return Promise.reject();
        } else {
            //保存该分类
            return new Category({
                name: name
            }).save();
        }
    }).then(function (newCategory) {
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '添加成功',
            url: '/admin/category'
        });
    });

});

/**
 * 修改分类
 */
router.get('/category/edit', function (req, res) {

    var id = req.query.id || '';
    Category.findOne({
        _id: id
    }).then(function (category) {
        if (!category) {
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: '分类信息不存在'
            });
        } else {
            res.render('admin/category_edit', {
                userInfo: req.userInfo,
                category: category
            });
        }
    });
});

/**
 * 修改分类保存
 */
router.post('/category/edit', function (req, res) {

    var id = req.query.id || '';
    var name = req.body.name || '';

    //获取要修改的分类信息
    Category.findOne({
        _id: id
    }).then(function (category) {
        if (!category) {
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: '分类信息不存在'
            });
            return Promise.reject();
        } else {
            if (name == category.name) {
                res.render('admin/success', {
                    userInfo: req.userInfo,
                    message: '修改成功',
                    url: '/admin/category'
                });
                return Promise.reject();
            } else {
                //要修改的分类名称是否已经在数据库中存在
                return Category.findOne({
                    _id: {$ne: id},//$ne 不等于
                    name: name
                });
            }
        }
    }).then(function (sameCategory) {
        if (sameCategory) {
            res.render('admin/error', {
                'userInfo': req.userInfo,
                'message': '数据库中已经存在同名分类'
            });
            return Promise.reset();
        } else {
            return Category.update({
                _id: id
            }, {
                name: name
            });
        }
    }).then(function () {
        res.render('admin/success', {
            'userInfo': req.userInfo,
            'message': '修改成功',
            'url': '/admin/category'
        });
    });
});

/**
 * 删除分类
 */
router.get('/category/delete', function (req, res) {
    var id = req.query.id || '';
    Category.remove({
        '_id': id
    }).then(function () {
        res.render('admin/success', {
            'userInfo': req.userInfo,
            'message': '删除成功',
            'url': '/admin/category'
        })
    });
});

/**
 * 内容首页
 */
router.get('/content', function (req, res) {
    var page = Number(req.query.page || 1);
    var limit = 10;
    var pages = 0;
    Content.count().then(function (count) {
        pages = Math.ceil(count / limit);
        page = Math.min(page, pages);
        page = Math.max(page, 1);
        var skip = (page - 1) * limit;

        Content.find().sort({_id: -1}).limit(limit).skip(skip).populate(["category","user"]).then(function (contents) {
            res.render('admin/content_index', {
                userInfo: req.userInfo,
                contents: contents,
                page: page,
                count: count,
                pages: pages,
                limit: limit,
                url: '/admin/content'
            });
        });
    });
});

/**
 * 内容添加
 */
router.get('/content/add', function (req, res) {

    Category.find().sort({_id: -1}).then(function (categories) {
        res.render('admin/content_add', {
            userInfo: req.userInfo,
            categories: categories
        });
    });

});

/**
 * 内容保存
 */
router.post('/content/add', function (req, res) {
    //验证
    if (req.body.category == '') {
        res.render('admin/error', {
            userInfo: req.userInfo,
            message: '内容分类不能为空'
        })
        return;
    }
    if (req.body.title == '') {
        res.render('admin/error', {
            userInfo: req.userInfo,
            message: '内容标题不能为空'
        })
        return;
    }

    new Content({
        category: req.body.category,
        title: req.body.title,
        user: req.userInfo._id.toString(),
        description: req.body.description,
        content: req.body.content
    }).save().then(function (rs) {
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '添加成功',
            url: '/admin/content'
        });
    });
});

/**
 * 内容修改
 */
router.get('/content/edit', function (req, res) {

    var id = req.query.id || '';
    var categories = [];
    Category.find().sort({_id: -1}).then(function (rs) {
        categories = rs;
        return Content.findOne({
            _id: id
        }).populate('category');
    }).then(function (content) {
        if (!content) {
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: '该信息不存在'
            });
            return Promise.reject();
        } else {
            res.render('admin/content_edit', {
                userInfo: req.userInfo,
                categories: categories,
                content: content
            });
        }

    });
});

/**
 * 内容修改保存
 */
router.post('/content/edit', function (req, res) {
    var id = req.query.id || '';
    if (!req.body.title) {
        res.render('admin/error', {
            userInfo: req.userInfo,
            message: '内容标题不能为空'
        });
        return;
    }

    if (!req.body.description) {
        res.render('admin/error', {
            userInfo: req.userInfo,
            message: '内容简介不能为空'
        });
        return;
    }

    Content.update({
        _id: id
    }, {
        category: req.body.category,
        title: req.body.title,
        description: req.body.description,
        content: req.body.content
    }).then(function () {
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '修改成功',
            url: '/admin/content'
        });
    });
});

/**
 * 内容删除
 */
router.get('/content/delete', function (req, res) {
    var id = req.query.id || '';
    Content.remove({
        _id: id
    }).then(function () {
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '删除成功',
            url: '/admin/content'
        });
    });
});

module.exports = router;