var redis = require('redis')
const base32 = require('base-32').default;
const crypto = require('crypto');

var key = '9Dvss22KnWSG/z+l/yM6JkB9adtwEoF8'
var iv = 'fffddf1968735720'
// var config = require('../config/config.js')
// var url = config.redis_conf.host

/**
 * 加密方法
 * @param key 加密key
 * @param iv       向量
 * @param data     需要加密的数据
 * @returns string
 */
 var encrypt = function (data) {   
    var cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    cipher.setAutoPadding(true);
    //console.log(typeof(data),);
    var crypted = cipher.update(data,'utf8','binary',);
    //console.log(crypted,'1');
    crypted += cipher.final('binary');
    crypted = base32.encode(Buffer.from(crypted, 'binary'))

    //去除补位
    for(var i=0;i<crypted.length-1;i++){
        //console.log(token[token.length-1]);
        if(crypted[crypted.length-1-i] != '='){
        //console.log(i);
            crypted = crypted.substr(0,crypted.length-i)
            console.log(crypted);
            break
        }
    }
    return crypted;
};
/**
 * 解密方法
 * @param key      解密的key
 * @param iv       向量
 * @param crypted  密文
 * @returns string
 */
var decrypt = function (crypted) {

    //补位
    let i = 8-(crypted.length%8)
    console.log(i);
    for(var j=0;j<i;j++){
        crypted = crypted+'='
    }
    console.log(crypted);

    crypted = base32.decode(crypted)
    //console.log(crypted);
    var decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    decipher.setAutoPadding(true);
    var decoded = decipher.update(crypted, 'binary', 'utf8');
    //console.log(decoded);
    decoded += decipher.final('utf8');
    return decoded;
}

/**
 * 密码加密方法
 * @param data  密码
 * @returns string
 */
var passwordEncrypt = function(data){
    let key = 'gs8dsh32dfg/'
    let md5 = crypto.createHash('md5',key)
    let newPas = md5.update(data).digest('hex')
    return newPas
}

/**
 * 
 * @param {redis连接} url 
 * @returns 
 */
var connect = function(url){
    const redisClient = redis.createClient({host:url,prot:6379,no_ready_check:true})
    redisClient.auth('Lw135246', () => {
        console.log('redis连接');
    })
    redisClient.on('error', err => {
        console.error(err)
    })
    return redisClient
}

//设置存储token
async function setRedis(url,data,token,callback){
    let redisClient =await connect(url)
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
async function getRedis(url,data,callback){
    let redisClient =await connect(url)
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
async function delectRedis(url,data,callback){
    let redisClient =await connect()
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
 * 验证token
 * @param {当前数据库环境} environ_nam
 * @param {当前域名} data 
 * @param {但前环境redis数据库地址} url
 * @param {当前域名下的token值} token 
 * @param {回调} callback 
 */
function decrypt_token(url,environ_name,data,token){
    //console.log(environ_name,data,token);
    //console.log(`${config.environ_name}admin-api.lewei.life`);
    return new Promise((resolve, reject) => {
        let domin = `${environ_name}admin-api.lewei.life`
        if(data === domin){  //验证域名

            //解析token
            let newToken = JSON.parse(decrypt(token));
            console.log(newToken);
            if (newToken.appId === 'admin-api') { //验证是不是admin

                //获取token
                getRedis(url,`zero_admin_token:${newToken.userId}:admin-api`,function(exist_token){
                    console.log(exist_token,'11');
                    if (exist_token === token) {
                        resolve(true)
                    }else{
                        resolve(false)
                    }
                })
            }
            else{
                resolve(false)
            }
        }
        else{
            resolve(false)
        }
    })     
}

module.exports = {
    encrypt,
    decrypt,
    passwordEncrypt,
    getRedis,
    delectRedis,
    decrypt_token,
    setRedis
}