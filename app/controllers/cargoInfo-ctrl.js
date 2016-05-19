/**
 * Created by sammy on 2016/5/4.
 */

var mongoose = require('mongoose');
var cargoInfoModel = mongoose.model('CargoInfo');

var lorryInfoModel = mongoose.model('LorryInfo');
var lorryModel = mongoose.model('Lorry');
var userModel = mongoose.model('User');

var Q = require('q');

var crypto =  require('crypto');
var fs = require('fs');
//var User = new userModel(); // 实例化对象

var JPush = require("jpush-sdk/lib/JPush/JPush.js");
var client = JPush.buildClient('9b09306a009f0190907da8c3', 'c2c909d9539cea85010aacd8');

var cargoInfoCtrl = {};

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

function getIdByFiled(len,type){
    var deferred = Q.defer();
    lorryModel
        .find({lorryLength:len,lorryType:type})
        .select('_id')
        .exec(function(err,docs){
            if (err) {
                console.log(err);
                deferred.reject(err);
            }
            deferred.resolve(docs);
        });

    return deferred.promise;
};

function getDriverID(cargo){

    var deferred = Q.defer();

    var cityFrom = cargo.from,
        cityTo = cargo.to,
        needLorryLen = cargo.lorryLength,
        needLorryType = cargo.lorryType,
        dateTime = cargo.dateTime;
    var ids = [];


    cityFrom = cityFrom.split("市")[0];
    cityTo = cityTo.split("市")[0];

    // 怎么进行多表查询呢？？现在也只能用这个挫办法了。。
    getIdByFiled(needLorryLen,needLorryType)
        .then(function(data){                 // data为车长为needLorryLen，车型为needLorryType的车辆id
            lorryInfoModel
                .find({
                    from:new RegExp(cityFrom),
                    to:new RegExp(cityTo),
                    dateTime:dateTime,
                    lorry: { $in: data }
                })
                .select('user')
                .exec(function(err,uids){       //  uids为满足货源条件的车源的车主id
                    //console.log("uids",uids);
                    if(err){
                        deferred.reject(err);
                    }
                    for(var i = 0;i<uids.length;i++){
                      ids.push(uids[i].user+"");
                    }
                    deferred.resolve(ids);
                });

        },function(err){
            console.log(err);
        });


    return deferred.promise;
}

cargoInfoCtrl.addCargoInfo = function(req,res,next){
    var from      = req.body.from,
          to       = req.body.to,
        distance   = req.body.distance,
        dateTime   = req.body.dateTime, // 字符串类型
        name       = req.body.name,
        load       = req.body.load,
        lorryType  = req.body.lorryType,
        lorryLength= req.body.lorryLength,
        text       = req.body.text,
        userID     = req.body.userID,
        price      = req.body.price;

    if(isEmpty(from) || isEmpty(to) || isEmpty(dateTime) || isEmpty(name) || isEmpty(load) || isEmpty(lorryType) || isEmpty(lorryLength) || isEmpty(userID) || isEmpty(price)){
        return res.json({message:"字段不能为空，发布失败"});
    }

    userModel.findOne({_id:userID},function(err,data){
        if(err){
            console.log(err);
            return res.json({code:500,message:'数据库保存出错'});
        }
        if(data.ifAuth == false){
            return res.json({code:0,message:'您还未认证，无法发布货源'});
        }

        // 实体
        var cargoInfo = new cargoInfoModel({
            user:userID,
            from:from,
            to:to,
            distance:distance,
            dateTime:dateTime,
            name:name,
            load:load,
            lorryType:lorryType,
            lorryLength:lorryLength,
            text:text,
            price:price
        });

        cargoInfo.save(function(err,cargo){
            if(err){
                console.log(err);
                return res.json({code:"500",message:"数据库保存报错"});
            }


            // 保存成功，获取符合货源条件的车源的车主id给他们发推送消息
            getDriverID(cargo).then(function(uids){
                console.log(uids);

                if(uids.length != 0){
                    try{
                        //easy push
                        client.push().setPlatform(JPush.ALL)
                            .setAudience(JPush.alias(uids))
                            //.setAudience(JPush.ALL)
                            .setNotification(JPush.ios('您收到一条最新货源！快去抢单吧！'), JPush.android('您收到一条最新货源！快去抢单吧！', null, 1,{cid:cargo._id}))
                            .send(function(err, res) {
                                console.log(res);
                                if (err) {
                                    console.log(err.message);
                                } else {
                                    console.log('Sendno: ' + res.sendno);
                                    console.log('Msg_id: ' + res.msg_id);
                                }
                            });
                    }catch(err){
                        console.log(err);
                    }
                }
            },function(err){
                return res.json({code:500});
            });
            res.json({code:1,message:"发布成功！"});
        });
    });



}

cargoInfoCtrl.getListById = function(req,res,next){
    var userID     = req.body.userID;

    if(userID == "" || userID == null || userID == undefined){
        return res.json({message:"请先登录"});
    }

    cargoInfoModel.find({user:userID},function(err,data){
        if(err){
            console.log(err);
            return res.json({code:0});
        }
        res.json({code:1,cargos:data});
    });
}

cargoInfoCtrl.getList = function(req,res,next){
    cargoInfoModel
        .find({ifTrade:0})
        .sort({dateTime: 1})
        .populate([{path: 'user',select:'username ifAuth rating userImage realName'}])  // 嵌套查询，输出的就不是一个外键而已了;
        .exec(function(err,data){
            if (err) {
                console.log(err);
                return res.json({code: 0,message:"数据库查询出错"});
            }
            res.json({
                code: 1,
                cargos: data
            });
        });
}

cargoInfoCtrl.getById = function(req,res,next){

    cargoInfoModel
        .findOne({_id:req.body.cid})
        .populate([{path: 'user',select:'username ifAuth rating userImage realName'}])  // 嵌套查询，输出的就不是一个外键而已了;
        .exec(function(err,cargo){
            if (err) {
                console.log(err);
                return res.json({code:500,message:"数据库查找报错"});
            }
            res.json({code:1,cargo:cargo});
        });


}

cargoInfoCtrl.search = function(req,res,next){

    var        from = req.body.from,
                 to = req.body.to,
           dateTime = req.body.dateTime,
          lorryType = req.body.lorryType,
        lorryLength = req.body.lorryLength;


    cargoInfoModel
        .find({ifTrade:0,from:new RegExp(from),to:new RegExp(to),dateTime:new RegExp(dateTime),lorryType:new RegExp(lorryType),lorryLength:new RegExp(lorryLength)})
        .sort({dateTime: 1})
        .populate([{path: 'user',select:'username ifAuth rating userImage realName'}])  // 嵌套查询，输出的就不是一个外键而已了;
        .exec(function(err,cargo){
            if (err) {
                console.log(err);
                return res.json({code:500,message:"数据库查找报错"});
            }
            res.json({code:1,cargos:cargo});
        });
}

module.exports = cargoInfoCtrl;