const base32 = require('base-32').default;
const crypto = require('crypto');

var key = '9Dvss22KnWSG/z+l/yM6JkB9adtwEoF8'
var iv = 'fffddf1968735720'

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
};
/**
 * 密码加密方法
 * @param data  密码
 * @returns string
 */
var passwordEncrypt = function(data){
    let md5 = crypto.createHash('md5')
    let newPas = md5.update(data).digest('hex')
    return newPas
}
module.exports={encrypt,decrypt,passwordEncrypt }
