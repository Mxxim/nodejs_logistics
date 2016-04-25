/**
 * Created by xiaomin on 2016/1/18.
 */

var mongoose = require('mongoose');
var config = require('./config');

module.exports = function(){

    var db = mongoose.connect(config.mongodb);

    return db;

}