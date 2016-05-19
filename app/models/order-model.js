/**
 * Created by sammy on 2016/5/13.
 */
/**
 * Created by sammy on 2016/4/25.
 */

var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId; // 外键

// 定义字段的数据模型
var OrderSchema = new mongoose.Schema({
    driver_user:{                  // 车主
        type:ObjectId,
        ref:'User'
    },
    cargo_user:{
        type:ObjectId,          // 货主
        ref:'User'
    },
    cargo:{                    // 货源，这里面已经有货主信息了
        type:ObjectId,
        ref:'CargoInfo'
    },
    lorryNum:String,        // 车牌号码
    state:{               // 运单状态，0表示已取消，1表示配送中，2表示配送完成
        type:Number,
        default:1
    },
    createTime:String             // 创建时间
});

// 编译模型
var Order = mongoose.model('Order',OrderSchema); // logistics数据库中会生成一个cargoinfos表

module.exports = Order;