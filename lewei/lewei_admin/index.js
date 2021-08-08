const proxy = require('@webserverless/fc-express')
const express = require('express');
// const bodyParser = require('body-parser');
const router = require('./routes/index')
const getRawBody = require('raw-body');
const {decrypt_token} = require('./db/redis')
const app = express();
app.use('/', function (req, res, next) {
	// 设置请求头为允许跨域
    res.header("Access-Control-Allow-Origin", "*");
    // 设置服务器支持的所有头信息字段
    res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
    // 设置服务器支持的所有跨域请求的方法
    res.header("Access-Control-Allow-Methods", "GET,POST");
    // res.header("Access-control-Allow-Orign","http://127.0.0.1:8080")
    // next()方法表示进入下一个路由

    console.log(req.path)
    if(req.path != '/login'){
        let domain = req.headers.domain
        let token = req.headers.token
        decrypt_token(domain,token,function(value){//验证token
            console.log(value);
            if(!value){
                res.send('token错误')
                return
            }
        })
    }
    next();
});
app.use(express.urlencoded({extended:false}))
// 处理json格式的参数
app.use(express.json())
app.use('/',router)
const server = new proxy.Server(app);

module.exports.handler = async (req, res, context) => {
    req.body = await getRawBody(req);
    if(req.headers.host !== '1528907418698530.cn-shenzhen-internal.fc.aliyuncs.com'){
        console.log('非法请求')
    }else{
        server.httpProxy(req, res, context);
    }
    
};