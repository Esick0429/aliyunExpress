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
router.post('/login',services.login)
router.post('/quit',services.quit)
router.post('/router',services.router)
router.post('/create',services.addUser)
router.get('/list',services.getUser)
router.delete('/*',services.dUser)
router.post('/update/*',services.updateUser)
module.exports = router;
