var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://root:Lw135246@dds-wz975fe96170f9241908-pub.mongodb.rds.aliyuncs.com:3717,dds-wz975fe96170f9242412-pub.mongodb.rds.aliyuncs.com:3717/admin?replicaSet=mgset-46339342";
// var url = "mongodb://root:Lw135246@dds-wz975fe96170f9241.mongodb.rds.aliyuncs.com:3717,dds-wz975fe96170f9242.mongodb.rds.aliyuncs.com:3717/admin?replicaSet=mgset-46339342"
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
    // MongoClient.connect(url, { useUnifiedTopology: true }, function (err, db) {
    //     if (err) throw err;
    //     console.log("数据库已创建!");
    //     callback(db)
    // });
}

exports.findAll = async function (database, tablename, data) {
    let conn = await connect()
    var dbbase = conn.db(database);
    let total = await dbbase.collection(tablename).find(data).count();
    // console.log(total);
    let res = await dbbase.collection(tablename).find(data).toArray();
    // console.log(res);
    // let result = {total,res}
    conn.close();
    return {total,res};
}

//数据分页
exports.pageing = function (database, tablename, now, num, sort, callback) {
    connect(function (db) {
        var dbbase = db.db(database);
        var total;
        var dbbase = db.db(database);
        dbbase.collection(tablename).find().count({}, function (err, res) {
            if (err) throw err;
            total = res;
        });
        dbbase.collection(tablename).find().skip(now).limit(num).sort(sort).toArray(function (err, res) {
            if (err) throw err;
            // console.log(res)

            callback(res);
            db.close();
        });
    });
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