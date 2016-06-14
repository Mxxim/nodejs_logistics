/**
 * Created by sammy on 2016/5/9.
 */


/**
 * Created by sammy on 2016/4/25.
 */

var mongoose = require('mongoose');
var lorryModel = mongoose.model('Lorry');
var lorryInfoModel = mongoose.model('LorryInfo');

var crypto =  require('crypto');
var fs = require('fs');
//var User = new userModel(); // 实例化对象

var lorryCtrl = {};

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
 * 添加车辆
 * @param req
 * @param res
 * @param next
 */
lorryCtrl.add = function(req,res,next){

    // Regular expression for image type:
    // This regular image extracts the "jpeg" from "image/jpeg"
    var imageTypeRegularExpression      = /\/(.*?)$/;

    var base64Data = [];
    var      images = req.body.images,   // 4张照片
             userID = req.body.userID,
             number = req.body.number,
               load = req.body.load,
        lorryLength = req.body.lorryLength,
          lorryType = req.body.lorryType,
              space = req.body.space;

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
        //var uniqueRandomImageName            = 'image-' + uniqueSHA1String;
        var userUploadedFeedMessagesLocation = 'public/images/uploads/lorrys';
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

    // 将车辆添加进入数据库中
    var alorry = new lorryModel({  // 实体
        user:userID,
        number:number,
        load:load,
        lorryLength:lorryLength,
        lorryType:lorryType,
        space:space,                       // 载货空间（可为空）
        frontImg:imagePathList[0],
        sideImg:imagePathList[1],
        backImg:imagePathList[2],
        carIDImg:imagePathList[3],
        ifAuth:true
    });
    alorry.save(function(err,data){  // 将车辆存到数据库中,并返回保存对象
        console.log(data);
        if (err) {
            console.log(err);
            return res.json({code:500,message:"数据库保存报错"});
        } else{
            res.json({code:1,message:"添加成功！"});
        }
    });
};

/**
 * 根据ID获取车辆
 * @param req
 * @param res
 * @param next
 */
//userCtrl.getById = function(req,res,next){
//    userModel.findOne({_id:req.body.userID},function(err,user){
//        if (err) {
//            console.log(err);
//            return res.json({code:500,message:"数据库查找报错"});
//        }
//        res.json({code:1,user:{
//            id:user._id,
//            ifAuth:user.ifAuth,
//            rating:user.rating,
//            username:user.username,
//            userImage:user.userImage,
//            realName:user.realName
//        }});
//    })
//}

/**
 * 获取车辆列表
 * @param req
 * @param res
 * @param next
 */
lorryCtrl.getList = function(req,res,next){

    var userID = req.body.userID;

    lorryModel
        .find(function(err,lorrys){
            if(err){
                console.log(err);
                return res.json({code:0,message:"数据库查找报错"});
            }
            res.json({code:1,lorrys:lorrys});
        })
        //.populate([{path: 'user',select:'username ifAuth rating userImage realName'}])  // 嵌套查询，输出的就不是一个外键而已了;
        //.exec(function(err,data){
        //    if (err) {
        //        console.log(err);
        //        return res.json({code: 0,message:"数据库查询出错"});
        //    }
        //    res.json({
        //        code: 1,
        //        cargos: data
        //    });
        //});
}

/**
 * 删除车辆(该车辆下的车源也一起被删除)
 * @param req
 * @param res
 * @param next
 */
lorryCtrl.delete = function(req,res,next){

    var lid = req.body.lid;

    lorryModel.remove({_id:lid }, function(err){
        if(err){
            return res.json({code:0,message:"删除车辆出现错误"});
        }
        lorryInfoModel.remove({lorry:lid},function(err,data){
            if(err){
                return res.json({code:0,message:"删除车源出现错误"});
            }
            console.log(data);
            res.json({code:1,message:"删除成功！！"});
        });

    })
}


module.exports = lorryCtrl;