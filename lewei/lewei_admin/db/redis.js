var redis = require('redis')
var url = 'r-wz9nomv8cuauf0t1t7pd.redis.rds.aliyuncs.com'
var {decrypt} = require('./token')
var config = require('../config/config.js')
//var url = config.redis_conf.host
console.log(url);
//设置存储token
function setRedis(data,token,callback){
    const redisClient = redis.createClient({host:url,prot:6379,no_ready_check:true})
    redisClient.auth('Lw135246', () => {
        console.log('通过认证');
    })
    redisClient.on('error', err => {
        console.error(err)
    })
    redisClient.select(1,function(err,result){
        if (err) {
            console.log(err);
        }else{
            console.log(result);
            console.log(typeof(data),'111',typeof(token));
            redisClient.set(data,token,function(err,value){
                if(err) {
                    throw err
                }
                console.log(value)
                callback(value)
                redisClient.expire(data,1200)//设置token过期20分钟
                redisClient.quit();
            })  
        }   
    })
}

//查找token
function getRedis(data,callback){
    const redisClient = redis.createClient(6379,url)
    redisClient.auth('Lw135246', () => {
        console.log('通过认证');
    })
    redisClient.on('error', err => {
        console.error(err)
    })
    redisClient.select(1,function(err,result){
        if (err) {
            console.log(err);
        }else{
            redisClient.get(data,function(err,value){
                if(err) throw err
                console.log(value)
                redisClient.expire(data,1200)//token延期
                callback(value)
                redisClient.quit();
            }) 
        }
    }) 
}
/*
*清除token
*/
function delectRedis(data,callback){
    const redisClient = redis.createClient(6379,url)
    redisClient.auth('Lw135246', () => {
        console.log('通过认证');
    })
    redisClient.on('error', err => {
        console.error(err)
    })
    redisClient.select(1,function(err,result){
        if (err) {
            console.log(err);
        }else{
            let newToken = JSON.parse(decrypt(data));
            console.log(newToken);
            let delToken = `zero_admin_token:${newToken.userId}:admin-api`
            redisClient.del(delToken,function(err,value){
                if(err) throw err
                console.log(value)
                callback(value)
                redisClient.quit();
            })
        } 
    }) 
}


/**
 * *验证token
 * data 请求的domain
 * token 请求的token
 * callback 返回验证token值
*/
function decrypt_token(data,token,callback){
    console.log(data,token);
    //console.log(`${config.environ_name}admin-api.lewei.life`);
    let domin = `${config.environ_name}admin-api.lewei.life`
    if(data == domin){  //验证域名

        //解析token
        let newToken = JSON.parse(decrypt(token));
        console.log(newToken);
        if (newToken.appId == 'admin-api') { //验证是不是admin

            //获取token
            getRedis(`zero_admin_token:${newToken.userId}:admin-api`,function(exist_token){
                console.log(exist_token,'11');
                if (exist_token == token) {
                    
                    callback(true)
                }else{
                    callback(false)
                }
            })
        }
        else{
            callback(false)
        }
    }
    else{
        callback(false)
    }    
}

module.exports = {
    getRedis,
    delectRedis,
    decrypt_token,
    setRedis
}