/**
 * Created by sammy on 2016/5/10.
 */

var mongoose = require('mongoose');
var lorryInfoModel = mongoose.model('LorryInfo');

var crypto =  require('crypto');
var fs = require('fs');
//var User = new userModel(); // 实例化对象

var lorryInfoCtrl = {};

function isEmpty(str){
    if(str === undefined || str === "" || str.length == 0){
        return true;
    }
    return false;
}

function StringToDate(str){
    var strDate = str.split("-");   // [0]年 [1]月 [2]日
    return new Date(strDate[0],strDate[1],strDate[2]);
}

lorryInfoCtrl.add = function(req,res,next){
    var from      = req.body.from,
        to        = req.body.to,
        dateTime   = req.body.dateTime, // 字符串类型
        lorry      = req.body.lorryID,
        text       = req.body.text,
        user       = req.body.userID

    if(isEmpty(from) || isEmpty(to) || isEmpty(dateTime) || isEmpty(lorry) || isEmpty(user)){
        return res.json({message:"字段不能为空，发布失败"});
    }

    // 实体
    var cargoInfo = new lorryInfoModel({
        user:user,
        lorry:lorry,
        from:from,
        to:to,
        dateTime:dateTime,
        text:text
    });

    cargoInfo.save(function(err,cargoInfo){
        if(err){
            console.log(err);
            return res.json({code:"500",message:"数据库保存报错"});
        }
        res.json({code:1,message:"发布成功！"});
    });

}

//lorryInfoCtrl.getListById = function(req,res,next){
//    var userID     = req.body.userID;
//
//    if(userID == "" || userID == null || userID == undefined){
//        return res.json({message:"请先登录"});
//    }
//
//    cargoInfoModel.find({user:userID},function(err,data){
//        if(err){
//            console.log(err);
//            return res.json({code:0});
//        }
//        res.json({code:1,cargos:data});
//    });
//}
//
lorryInfoCtrl.getList = function(req,res,next){
    lorryInfoModel
        .find()
        .populate([{path: 'lorry',select:'dateTime lorryType lorryLength number load space frontImg'}])  // 嵌套查询，输出的就不是一个外键而已了;
        .exec(function(err,data){
            if (err) {
                console.log(err);
                return res.json({code: 0,message:"数据库查询出错"});
            }
            res.json({
                code: 1,
                lorryInfos: data
            });
        });
}
//
//lorryInfoCtrl.getById = function(req,res,next){
//
//    cargoInfoModel
//        .findOne({_id:req.body.cid})
//        .populate([{path: 'user',select:'username ifAuth rating userImage realName'}])  // 嵌套查询，输出的就不是一个外键而已了;
//        .exec(function(err,cargo){
//            if (err) {
//                console.log(err);
//                return res.json({code:500,message:"数据库查找报错"});
//            }
//            res.json({code:1,cargo:cargo});
//        });
//
//
//}

module.exports = lorryInfoCtrl;