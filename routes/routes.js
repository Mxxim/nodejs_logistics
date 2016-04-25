/**
 * Created by sammy on 2016/4/25.
 */

var express = require('express');
var router = express.Router();

var User = require("../app/controllers/user-ctrl");


// user
router.post('/user/signup',User.signUp);
router.post('/user/signin',User.signIn);


module.exports = router;