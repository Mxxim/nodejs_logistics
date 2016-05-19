/**
 * Created by sammy on 2016/5/13.
 */

var mongoose = require('mongoose');
var OrderModel = mongoose.model('Order');
var cargoInfoModel = mongoose.model('CargoInfo');

var crypto =  require('crypto');
var fs = require('fs');

var JPush = require("jpush-sdk/lib/JPush/JPush.js");
var client = JPush.buildClient('fd5f50b380840e4f96745bc1', 'a0b2a4ad438e4d57f34bf50f');

var orderCtrl = {};

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

function getDate(val){
    if(!val){
        return;
    }

    var month = val.getMonth()+1;
    var day = val.getDate();
    var hour = val.getHours();
    var minute = val.getMinutes();

    if(month > 0 && month <=9){
        month = "0"+month;
    }
    if(day > 0 && day <=9){
        day = "0"+day;
    }
    if(hour > 0 && hour <=9){
        hour = "0"+hour;
    }
    if(minute > 0 && minute <=9){
        minute = "0"+minute;
    }

    return val.getFullYear()+"-"+month + "-" + day+" "+hour + ":"+minute;
}

function getUserByCargoInfoID(cid){
    cargoInfoModel.findOne({_id:cid},function(){

    });
}

orderCtrl.add = function(req,res,next){
    var cargoID      = req.body.cargoID,        //货源ID
        userID        = req.body.userID,        //车主ID
        lorryNum      = req.body.lorryNum,      //车牌号
        createTime = getDate(new Date());
        //createTime = new Date();

    console.log(cargoID);
    console.log(userID);
    console.log(lorryNum);

    if(isEmpty(cargoID) || isEmpty(userID) || isEmpty(lorryNum)){
        return res.json({message:"字段不能为空，发布失败"});
    }

    // 找到这个货源下的货主ID，然后保存运单。并且将该货源的交易状态改为【交易中】
    cargoInfoModel.findOne({_id:cargoID},function(err,cargoInfo){
            if(err){
                return res.json({code:500})
            }
        // 实体
        var order = new OrderModel({
            cargo:cargoID,
            driver_user:userID,
            cargo_user:cargoInfo.user,
            lorryNum:lorryNum,
            state:1,
            createTime:createTime
        });
        order.save(function(err,order){
            if(err){
                console.log(err);
                return res.json({code:"500",message:"数据库保存报错"});
            }

            cargoInfoModel.update({_id:cargoID},{
                $set:{
                    ifTrade:1
                }
            }).exec();

            //easy push
            client.push().setPlatform(JPush.ALL)
                .setAudience(JPush.alias(cargoInfo.user+""))
                //.setAudience(JPush.ALL)
                .setNotification(JPush.ios('有车主接了您的货源，赶紧去看看！'), JPush.android('有车主接了您的货源，赶紧去看看！', null, 1))
                .send(function(err, res) {
                    console.log(res);
                    if (err) {
                        console.log(err.message);
                    } else {
                        console.log('Sendno: ' + res.sendno);
                        console.log('Msg_id: ' + res.msg_id);
                    }
                });

            res.json({code:1,message:"添加运单成功！"});
        });


    });

}

orderCtrl.getList = function(req,res,next){

    var userID = req.body.userID,
        state = req.body.state,
        type = req.body.type;

    console.log(userID);
    console.log(state);
    console.log(type);
    console.log(type == 1);

    // 车主
    if(type == 1){
        OrderModel
            .find({driver_user:userID,state:state})
            .populate([
                //{path: 'driver_user',select:'username realName '},
                {path: 'cargo'},
                {path:'cargo_user',select:'username realName'}
            ])  // 嵌套查询，输出的就不是一个外键而已了;
            .exec(function(err,data){
                if (err) {
                    console.log(err);
                    return res.json({code: 0,message:"数据库查询出错"});
                }
                console.log(data);
                res.json({
                    code: 1,
                    orders: data
                });
            });
    }
    // 货主
    else{
        OrderModel
            .find({cargo_user:userID,state:state})
            .populate([
                {path: 'driver_user',select:'username realName '},
                {path: 'cargo'}
                //{path:'cargo_user',select:'username realName'}
            ])  // 嵌套查询，输出的就不是一个外键而已了;
            .exec(function(err,data){
                if (err) {
                    console.log(err);
                    return res.json({code: 0,message:"数据库查询出错"});
                }
                console.log(data);
                res.json({
                    code: 1,
                    orders: data
                });
            });
    }
    //var agg = OrderModel.aggregate();
    //agg.group({_id:"$cargo"});
    ////agg.select('-id cargo');
    //agg.exec(function(err,data){
    //    if(err){
    //        console.log(err);
    //    }else{
    //        console.log(data);
    //    }
    //});
}

module.exports = orderCtrl;