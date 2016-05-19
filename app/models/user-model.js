/**
 * Created by sammy on 2016/4/25.
 */

var mongoose = require('mongoose');

// 定义字段的数据模型
var match = [/^1[3|4|5|8][0-9]\d{8}$/,"{VALUE}应该为手机号码的格式"];
//var minLength = [6,"密码长度不小于6个字符"];
var UserSchema = new mongoose.Schema({
    username:{                          // 用户名（手机号码）
        type:String,
        match:match,
        required:true
    },
    password:{                          // 密码
        type:String,
        required:true
        //minLength:minLength
    },
    realName:String,                    // 真实姓名
    userType:{                          // 用户类型，0表示货主，1表示车主
        type:Number,
        min:0,
        max:1,
        required:true
    },
    IDCardImg:String,                // 身份证正面照路径
    IDCardBackImg:String,                 // 身份证背面照路径
    userImage:String,                     // 个人近照路径
    carCardImg:String,                     // 驾驶证照路径
    ifAuth:{                            // 是否认证，false表示未认证，true表示已认证
        type:Boolean,
        required:true
    },
    rating: {                           // 用户评分。货源推送将按照分数顺序来推送
        type:Number,
        default:0
    }
});

// 编译模型
var User = mongoose.model('User',UserSchema); // logistics数据库中会生成一个users表

module.exports = User;