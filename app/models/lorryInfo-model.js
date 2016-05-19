/**
 * Created by sammy on 2016/5/10.
 */
/**
 * Created by sammy on 2016/4/25.
 */

var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId; // 外键


// 定义字段的数据模型
var LorryInfoSchema = new mongoose.Schema({
    user:{                  // 货主
        type:ObjectId,
        ref:'User'
    },
    lorry:{                 // 车辆
        type:ObjectId,
        ref:'Lorry'
    },
    from:{                  // 出发地（*）
        type:String,
        require:true
    },
    to:{                    // 目的地（*）
        type:String,
        require:true
    },
    dateTime:{              // 装货时间（*）
        type:String,
        require:true
    },
    ifTrade:{               // 是否交易
        type:Boolean,
        default:false
    },
    text:String             // 备注
});

// 编译模型
var LorryInfo = mongoose.model('LorryInfo',LorryInfoSchema); // logistics数据库中会生成一个lorryinfos表

module.exports = LorryInfo;