var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://root:Lw135246@dds-wz975fe96170f9241908-pub.mongodb.rds.aliyuncs.com:3717,dds-wz975fe96170f9242412-pub.mongodb.rds.aliyuncs.com:3717/admin?replicaSet=mgset-46339342'
//var url = "mongodb://root:Lw135246@dds-wz975fe96170f9241.mongodb.rds.aliyuncs.com:3717,dds-wz975fe96170f9242.mongodb.rds.aliyuncs.com:3717/admin?replicaSet=mgset-46339342"
var connect = function (callback) {
    MongoClient.connect(url, { useUnifiedTopology: true }, function (err, db) {
        if (err) throw err;
        console.log("数据库已创建!");
        callback(db)
    });
}

exports.findAll = function (database, tablename, data, callback) {
    connect(function (db) {
        var total;
        var dbbase = db.db(database);
        dbbase.collection(tablename).find(data).count({}, function (err, res) {
            if (err) throw err;
            total = res;
        });
        dbbase.collection(tablename).find(data).toArray(function (err, data) {
            if (err) throw err;
            callback(total, data);
            db.close();
        });
    });
}

exports.find = function (database, tablename, data, callback) {
    connect(function (db) {
        //var total;
        var dbbase = db.db(database);
        dbbase.collection(tablename).find(data).toArray(function (err, data) {
            if (err) throw err;
            callback(data);
            db.close();
        });
    });
}

//数据分页
exports.pageing = function (database, tablename,data, now, num, sort, callback) {
    connect(function (db) {
        var dbbase = db.db(database);
        var total;
        var dbbase = db.db(database);
        dbbase.collection(tablename).find(data).count({}, function (err, res) {
            if (err) throw err;
            total = res;
        });
        dbbase.collection(tablename).find(data).skip(now).limit(num).sort(sort).toArray(function (err, res) {
            if (err) throw err;
            console.log(res)

            callback(total,res);
            db.close();
        });
    });
}

//插入单条数据
exports.insertOne = function (database, tablename, data, callback) {
    connect(function (db) {
        var dbbase = db.db(database);
        dbbase.collection(tablename).insertOne(data, function (err, res) {
            if (err) throw err;
            callback(res.result);
            db.close();
        });
    });
}

//删除单条数据
exports.dRole = function (database, tablename, data, set, callback) {
    connect(function (db) {
        var dbbase = db.db(database);
        dbbase.collection(tablename).updateOne(data, set, function (err, res) {
            if (err) throw err;
            callback(res);
            db.close();
        });
    });
}

//更新
exports.updateInfo = function (database, tablename, data, set, callback) {
    connect(function (db) {
        var dbbase = db.db(database);
        dbbase.collection(tablename).updateOne(data, set, function (err, res) {
            if (err) throw err;
            callback(res);
            db.close();
        });
    });
}