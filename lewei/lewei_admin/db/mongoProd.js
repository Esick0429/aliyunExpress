// import { mongodbUrl } from '../../../config/test-config';
const config  = require('../config/config.js')
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://root:Lw135246@dds-wz9d6a6d9e6c9f141957-pub.mongodb.rds.aliyuncs.com:3717,dds-wz9d6a6d9e6c9f142977-pub.mongodb.rds.aliyuncs.com:3717/admin?replicaSet=mgset-46400415'
// var url = config.mongodb_url
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
//统计总数
exports.count = async function (database, tablename, data){
    let conn = await connect()
    var dbbase = conn.db(database);
    let total = await dbbase.collection(tablename).find(data).count();
    conn.close();
    return total
}

//查询排序
exports.findSort = async function (database,tablename, data, sort){
    let conn = await connect()
    var dbbase = conn.db(database);
    let res = await dbbase.collection(tablename).find(data).sort(sort).toArray();
    conn.close();
    return res
}

//查排序条数
exports.findSortLimit = async function (database,tablename, data, sort,limit){
    let conn = await connect()
    var dbbase = conn.db(database);
    // console.log(database, tablename, data, sort, limit);

    let res = await dbbase.collection(tablename).find(data).sort(sort).limit(limit).toArray();
    conn.close();
    return res
}

//普通查询
exports.findData = async function (database, tablename, data) {
    let conn = await connect()
    var dbbase = conn.db(database);
    // let total = await dbbase.collection(tablename).find(data).count();
    // console.log(database, tablename, data);
    let res = await dbbase.collection(tablename).find(data).toArray();
    // console.log(res);
    // let result = {total,res}
    conn.close();
    return res
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