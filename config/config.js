/**
 * Created by xiaomin on 2016/1/18.
 */

var config = null;

if(process && process.env && process.env.NODE_ENV) {
    config = require('./env/' + process.env.NODE_ENV + '.js');
} else {
    config = require('./env/development.js');
}

module.exports = config;