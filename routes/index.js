var express = require('express');
var router = express.Router();
const services = require('../services')
/* GET users listing. */
router.post('/addRole',services.addRole)
router.get('/getRole',services.getRole)
router.get('/getRouter',services.getRouter)
router.post('/dRole',services.dRole)
router.post('/updateInfo',services.updateInfo)
module.exports = router;
