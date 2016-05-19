/**
 * Created by sammy on 2016/4/25.
 */

var mongoose = require('mongoose');
var userModel = mongoose.model('User');

var crypto =  require('crypto');
var fs = require('fs');
//var User = new userModel(); // 实例化对象

var userCtrl = {};

var isEmpty = function(str){
    if(str === undefined || str === "" || str.length == 0){
        return true;
    }
    return false;
}

var decodeBase64Image = function(dataString) {
    var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
        response = {};

    if (matches.length !== 3) {
        return new Error('Invalid input string');
    }

    response.type = matches[1];
    response.data = new Buffer(matches[2], 'base64');

    return response;
}

/**
 * 用户注册
 * @param req
 * @param res
 * @param next
 */
userCtrl.signUp = function(req,res,next){

    var username = req.body.username,
        password = req.body.password,
    re_password = req.body.re_password,
        realName = req.body.realName,
        type = req.body.type;
    //var password = 123,
        //re_password =123;

    if(isEmpty(username) || isEmpty(password) || isEmpty(re_password) || isEmpty(type) || isEmpty(realName)){
            return res.json({message:"不允许为空的字段置为了空，提交失败"});
    }else if(!username.match(/^1[3|4|5|8][0-9]\d{8}$/)){
        return res.json({message:"用户名必须为手机号码"});
    }

    // 判断两次密码是否一致
    if(password !== re_password){
        return res.json({code:2,message:"两次密码不一致"});
    }

    //判断用户是否存在
    userModel.findOne({username:username,userType:type},function(err,user){
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
                realName:realName,
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

    var username = req.body.username,
        password = req.body.password,
        type = req.body.type;

    if(isEmpty(username) || isEmpty(password) || isEmpty(type)){
        return res.json({message:"不允许为空的字段置为了空，提交失败"});
    }

    password = crypto.createHash("md5").update(password).digest("hex"); // 每次都要重新构建Hash

    userModel.findOne({username:username,userType:type},function(err,user){
        //console.log(user.userType);
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
            res.json({code:1,user:{
                id:user._id,
                ifAuth:user.ifAuth,
                rating:user.rating,
                username:user.username,
                userImage:user.userImage,
                realName:user.realName
            }});
        }
    })
};

/**
 * 用户认证
 * @param req
 * @param res
 * @param next
 */
userCtrl.authentication = function(req,res,next){

    // Regular expression for image type:
    // This regular image extracts the "jpeg" from "image/jpeg"
    var imageTypeRegularExpression      = /\/(.*?)$/;

    var base64Data = [];
    var images = req.body.images,
        userID = req.body.userID;

    console.log(userID);

    for(var key in images){
        if(images[key] == ''){
            return res.json({message:"不能为空，提交失败"});
        }
        base64Data.push(images[key]);
    }

    // 将图片上传到服务端
    var imagePathList = [];
    for(var i in base64Data){
        // 产生一串随机的字符串
        var seed                            = crypto.randomBytes(20);
        var uniqueSHA1String                = crypto
            .createHash('sha1')
            .update(seed)
            .digest('hex');

        var imageBuffer                      = decodeBase64Image(base64Data[i]);
        var date = new Date(),
            year = date.getFullYear(),
            month = date.getMonth()+1,
            day = date.getDate();
        //var userUploadedFeedMessagesLocation = 'public/images/uploads/'+year+'-'+month+'-'+day+'/';
        var userUploadedFeedMessagesLocation = 'public/images/uploads/';
        var uniqueRandomImageName            = year+'-'+month+'-'+day+'-' + uniqueSHA1String;
        // This variable is actually an array which has 5 values,
        // The [1] value is the real image extension
        var imageTypeDetected                = imageBuffer
            .type
            .match(imageTypeRegularExpression);

        var userUploadedImagePath            = userUploadedFeedMessagesLocation +
            uniqueRandomImageName +
            '.' +
            imageTypeDetected[1];

        imagePathList.push(userUploadedImagePath.replace("public",""));
        console.log(userUploadedImagePath);

        // 将解码的二进制图片保存到服务端
        try
        {
            fs.writeFile(userUploadedImagePath, imageBuffer.data,
                function(err)
                {
                    if(err) throw err;
                    console.log('DEBUG - feed:message: Saved to disk image attached by user:', userUploadedImagePath);
                });
            //fs.writeFileSync(userUploadedImagePath, imageBuffer.data);
        }
        catch(error)
        {
            console.log('ERROR:', error);
        }
    }

    // 将解码的二进制图片路径保存到数据库
    /**
     * Model.update(conditions, doc, [options], [callback])
     * */
    userModel.update({_id:userID},{
        $set:{
            IDCardImg:imagePathList[0],
            IDCardBackImg:imagePathList[1],
            userImage:imagePathList[2],
            carCardImg:imagePathList[3],
            ifAuth:true
        }
    }).exec();

    res.json({code:1,message:"提交成功！"});
};

/**
 * 根据ID获取用户
 * @param req
 * @param res
 * @param next
 */
userCtrl.getById = function(req,res,next){
    userModel.findOne({_id:req.body.userID},function(err,user){
        if (err) {
            console.log(err);
            return res.json({code:500,message:"数据库查找报错"});
        }
            res.json({code:1,user:{
                id:user._id,
                ifAuth:user.ifAuth,
                rating:user.rating,
                username:user.username,
                userImage:user.userImage,
                realName:user.realName
            }});
    })
}



module.exports = userCtrl;