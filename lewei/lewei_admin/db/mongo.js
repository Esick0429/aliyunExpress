// import { mongodbUrl } from '../../../config/test-config';
const config  = require('../config/config.js')
var MongoClient = require('mongodb').MongoClient;
// var url = 'mongodb://root:Lw135246@dds-wz975fe96170f9241908-pub.mongodb.rds.aliyuncs.com:3717,dds-wz975fe96170f9242412-pub.mongodb.rds.aliyuncs.com:3717/admin?replicaSet=mgset-46339342'
var url = config.mongodb_url
var connect = function () {
    return new Promise(( resolve, reject ) => {
        MongoClient.connect(url, { useUnifiedTopology: true }, function (err, db) {
            if (err) {
                reject( err )
            } else {
                // console.log(db)
                console.log("数据库已创建!");
                resolve(db)
            }
        });
    })
}

exports.findAll = async function (database, tablename, data) {
    const conn = await connect()
    const dbbase = conn.db(database);
    let total = await dbbase.collection(tablename).find(data).count();
    // console.log(total);
    let res = await dbbase.collection(tablename).find(data).toArray();
    // console.log(res);
    // let result = {total,res}
    conn.close();
    return {total,res};
}

exports.find = async function(database,collectionName,json,sort){
    if(!collectionName || !json ) throw '参数错误';
    const conn = await connect()
    const dbbase = conn.db(database);
    //let total = await dbbase.collection(tablename).find(data).count();
    let res =await dbbase.collection(collectionName).find(json).sort(sort).toArray();
    conn.close();
    return res;
}

//数据分页
exports.pageing = async function (database, tablename,data, now, num, sort) {
    const conn = await connect();
    const dbbase = conn.db(database);
    let total = await dbbase.collection(tablename).find(data).count();
    let res = await dbbase.collection(tablename).find(data).skip(now).limit(num).sort(sort).toArray();
    conn.close();
    return {total,res};
}


//插入单条数据
exports.insertOne = async function (database, tablename, data) {
    const conn = await connect();
    const dbbase = conn.db(database);
    let res = dbbase.collection(tablename).insertOne(data);
    conn.close
    return res
}

//删除单条数据
exports.dRole = async function (database, tablename, data, set) {
    const conn = await connect();
    const dbbase = conn.db(database);
    let res = dbbase.collection(tablename).updateOne(data, set)
    conn.close
    return res
}

//更新
exports.updateInfo = async function (database, tablename, data, set, callback) {
    const conn = await connect();
    const dbbase = conn.db(database);
    let res = dbbase.collection(tablename).updateOne(data, set)
    conn.close
    return res
}