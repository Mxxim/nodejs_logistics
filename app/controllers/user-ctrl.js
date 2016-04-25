/**
 * Created by sammy on 2016/4/25.
 */

var mongoose = require('mongoose');
var userModel = mongoose.model('User');

var crypto = require('crypto');
//var User = new userModel(); // 实例化对象

var userCtrl = {};

function ifEmpty(str){
    if(str === undefined || str === "" || str.length == 0){
        return true;
    }
    return false;



}

/**
 * 用户注册
 * @param req
 * @param res
 * @param next
 */
userCtrl.signUp = function(req,res,next){

    var username = req.query.username,
        password = req.query.password,
    re_password = req.query.re_password,
        type = req.query.type;
    //var password = 123,
        //re_password =123;

    if(ifEmpty(username) || ifEmpty(password) || ifEmpty(re_password) || ifEmpty(type)){
            return res.json({message:"不允许为空的字段置为了空，提交失败"});
    }else if(!username.match(/^1[3|4|5|8][0-9]\d{8}$/)){
        return res.json({message:"用户名必须为手机号码"});
    }

    // 判断两次密码是否一致
    if(password !== re_password){
        return res.json({code:2,message:"两次密码不一致"});
    }

    //判断用户是否存在
    userModel.findOne({username:username},function(err,user){
        if (err) {
            console.log(err);
            return res.json({code:500,message:"数据库查找报错"});
        }
        if (!user || user === null || user.length === 0) {

            // 用户不存在,则存入数据库
            password = crypto.createHash("md5").update(password+"").digest("hex");
            var auser = new userModel({  // 实体
                username:username,
                password:password,
                userType:type,
                ifAuth:false
            });

            auser.save(function(err,user){  // 将用户保存到数据库中,并返回保存对象
                if (err) {
                    console.log(err);
                    return res.json({code:500,message:"数据库保存报错"});
                } else{
                    res.json({code:1});
                }
            });
        } else{
            res.json({code:0,message:"此用户已经注册过"});
        }
    });
};

/**
 * 用户登录
 * @param req
 * @param res
 * @param next
 */
userCtrl.signIn = function(req,res,next){

    var username = req.query.username,
        password = req.query.password,
        type = req.query.type;

    if(ifEmpty(username) || ifEmpty(password) || ifEmpty(type)){
        return res.json({message:"不允许为空的字段置为了空，提交失败"});
    }

    password = crypto.createHash("md5").update(password).digest("hex"); // 每次都要重新构建Hash

    userModel.findOne({username:username},function(err,user){
        if (err) {
            console.log(err);
            return res.json({code:500,message:"数据库查找报错"});
        }
        if (!user || user === null || user.length === 0 || type != user.userType) {
            res.json({code:0,message:"用户不存在"});
        } else if (password !== user.password) {
            res.json({code:2,message:"密码错误"});
        } else{
            //req.session.user = user; // 要先在app.js中加载中间件并配置才可使用
            res.json({code:1,user:user});
        }
    })
};

/**
 * 用户认证
 * @param req
 * @param res
 * @param next
 */
userCtrl.authenticate = function(req,res,next){

};


module.exports = userCtrl;