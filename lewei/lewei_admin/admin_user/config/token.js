const base32 = require('base-32').default;
const crypto = require('crypto');


/**
 * 加密方法
 * @param key 加密key
 * @param iv       向量
 * @param data     需要加密的数据
 * @returns string
 */
var encrypt = function (key, iv, data) {   
    var cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    cipher.setAutoPadding(true);
    console.log(typeof(data),);
    var crypted = cipher.update(data,'utf8','binary',);
    console.log(crypted,'1');
    crypted += cipher.final('binary');
    crypted = base32.encode(Buffer.from(crypted, 'binary'))
    return crypted;
};
/**
 * 解密方法
 * @param key      解密的key
 * @param iv       向量
 * @param crypted  密文
 * @returns string
 */
var decrypt = function (key, iv, crypted) {
    crypted = base32.decode(crypted)
    console.log(crypted);
    var decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    decipher.setAutoPadding(true);
    var decoded = decipher.update(crypted, 'binary', 'utf8');
    console.log(decoded);
    decoded += decipher.final('utf8');
    return decoded;
};
module.exports={encrypt,decrypt }
