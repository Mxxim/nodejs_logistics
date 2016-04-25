/**
 * Created by sammy on 2016/4/25.
 */

var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId; // 外键

// 定义字段的数据模型
var ArticleSchema = new mongoose.Schema({
    username:String,
    title:String,
    content:String,
    cate: {
        type: ObjectId,
        ref: 'ArticleCate'
    },
    dateTime:{
        type:String
    },
    comments:String
});

// 编译模型
var Article = mongoose.model('Article',ArticleSchema); // discuz数据库中会生成一个articless表

module.exports = Article;