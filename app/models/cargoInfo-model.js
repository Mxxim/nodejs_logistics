/**
 * Created by sammy on 2016/4/25.
 */

var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId; // 外键

var match = [/^1[3|4|5|8][0-9]\d{8}$/,"{VALUE}应该为手机号码的格式"];

// 定义字段的数据模型
var CargoInfoSchema = new mongoose.Schema({
    user:{                  // 货主
        type:ObjectId,
        ref:'User'
    },
    from:{                  // 出发地（*）
        type:String,
        require:true
    },
    to:{                    // 目的地（*）
        type:String,
        require:true
    },
    distance:{
        type:String
    },
    name: {                 // 货品名称
        type:String,
        require:true
    },
    dateTime:{              // 装货时间（*）
        type:String,
        require:true
    },
    load:{                  // 重量（*）
        type:Number,
        require:true
    },
    lorryType:{             // 需要货车类型（*）
        type:String
    },
    lorryLength:{           // 需要车长（*）
        type:String
    },
    receive:{               // 收货人信息
        name:String,
        tel:{
            type:Number,
            match:match
        }
    },
    price:{                 // 运费
        type:Number,
        require:true
    },
    ifTrade:{                // 交易状态，0表示未交易，1表示交易中，2表示交易完成
        type:Number,
        default:0
    },
    text:String             // 备注
});

// 编译模型
var CargoInfo = mongoose.model('CargoInfo',CargoInfoSchema); // logistics数据库中会生成一个cargoinfos表

module.exports = CargoInfo;