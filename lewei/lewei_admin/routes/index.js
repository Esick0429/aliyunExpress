var express = require('express');
var router = express.Router();
const services = require('./services')
/* GET users listing. */
//角色
router.post('/addRole',services.addRole)
router.get('/getRole',services.getRole)
router.get('/getRouter',services.getRouter)
router.post('/dRole',services.dRole)
router.post('/updateInfo',services.updateInfo)

//用户
router.post('/user/login',services.login)
router.post('/user/quit',services.quit)
router.post('/user/router',services.router)
router.post('/user/create',services.addUser)
router.get('/user/list',services.getUser)
router.delete('/user/*',services.dUser)
router.post('/user/*/update',services.updateUser)
module.exports = router;
