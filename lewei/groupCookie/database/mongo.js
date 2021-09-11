// 引入MongoDB 模块
const MongoDB = require("mongodb");
// 引入MongoDB 连接模块
const MongoClient = MongoDB.MongoClient;
// 引入MongoDB ObjectID模块
const ObjectID = MongoDB.ObjectID;
// 引入配置文件
const Config = require("../config/index");

  // 连接数据库
var connect = function() {
    return new Promise((resolve, reject) => {
      // 解决数据库多次连接的问题，要不然每次操作数据都会进行一次连接数据库的操作，比较慢
        // 第一次的时候连接数据库
        MongoClient.connect(Config.dbUrl, (err, client) => {
          if (err) {
            reject(err);
          } else {
            // 将连接数据库的状态赋值给属性，保持长连接状态
            console.log("数据库已连接");
            // this.dbClient = client.db(Config.dbName);
            resolve(client.db(Config.dbName));
          }
        })
    });
  }

  module.exports.connect = connect;
