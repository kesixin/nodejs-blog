/**
 * Created by Administrator on 2017/8/16.
 */

var mongoose = require('mongoose');

//内容的表结构
module.exports = new mongoose.Schema({

    //关联字段
    category: {
        //类型
        type: mongoose.Schema.Types.ObjectId,
        //引用
        ref: 'Category'
    },
    //标题
    title: String,

    //用户
    user: {
        //类型
        type: mongoose.Schema.Types.ObjectId,
        //引用
        ref: 'User'
    },

    //浏览次数
    views: {
        type: Number,
        default: 0
    },

    //时间
    addTime: {
        type: Date,
        default: new Date()
    },

    //简介
    description: {
        type: String,
        default: ''
    },
    //内容
    content: {
        type: String,
        default: ''
    },
    //评论内容
    comments: {
        type: Array,
        default: []
    }


});
