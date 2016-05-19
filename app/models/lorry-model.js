/**
 * Created by sammy on 2016/5/9.
 */

var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId; // 外键

var LorrySchema = new mongoose.Schema({
    user:{                  // 车主
        type:ObjectId,
        ref:'User'
    },
    number:{                               // 车牌号
        type:String,
        required:true
    },
    load:{                                 // 载重
        type:String,
        required:true
    },
    lorryLength:{                          // 车长
        type:String,
        required:true
    },
    lorryType:{                          // 车型
        type:String,
        required:true
    },
    space:String,                       // 载货空间（可为空）
    frontImg:{                          // 车头照片
        type:String,
        required:true
    },
    sideImg:{                          // 45度照片
        type:String,
        required:true
    },
    backImg:{                          // 车尾照片
        type:String,
        required:true
    },
    carIDImg:{                          // 车辆行驶证照片
        type:String,
        required:true
    },
    ifAuth:{                            // 车辆是否认证，false表示未认证，true表示已认证
        type:Boolean,
        default:false
    }
});

// 编译模型
var Lorry = mongoose.model('Lorry',LorrySchema); // logistics数据库中会生成一个users表

module.exports = Lorry;