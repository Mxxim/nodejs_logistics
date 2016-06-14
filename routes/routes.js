/**
 * Created by sammy on 2016/4/25.
 */

var express = require('express');
var multer = require('multer');

var upload = multer({dest:'public/images/uploads/'});
var router = express.Router();

var User = require("../app/controllers/user-ctrl");
var CargoInfo = require("../app/controllers/cargoInfo-ctrl");
var Lorry = require("../app/controllers/lorry-ctrl");
var LorryInfo = require("../app/controllers/lorryInfo-ctrl");
var Order = require("../app/controllers/order-ctrl");

// user
router.post('/user/signup',User.signUp);
router.post('/user/signin',User.signIn);
//router.post('/user/authentication',upload.single('fileAddPic'),User.authentication);
router.post('/user/authentication',User.authentication);
router.post('/user/getById',User.getById);

// cargoInfo
router.post('/cargo/add',CargoInfo.addCargoInfo);
router.post('/cargo/getListById',CargoInfo.getListById);
router.get('/cargo/getList',CargoInfo.getList);
router.post('/cargo/getById',CargoInfo.getById);
router.post('/cargo/query',CargoInfo.search);
router.post('/cargo/delete',CargoInfo.delete);

// lorry
router.post('/lorry/add',Lorry.add);
router.post('/lorry/getList',Lorry.getList);
router.post('/lorry/delete',Lorry.delete);

router.post('/lorryInfo/add',LorryInfo.add);
router.post('/lorryInfo/getList',LorryInfo.getList);
router.post('/lorryInfo/delete',LorryInfo.delete);

// order
router.post('/order/add',Order.add);
router.post('/order/getList',Order.getList);
router.post('/order/cancel',Order.cancel);
router.post('/order/confirm',Order.confirm);


module.exports = router;