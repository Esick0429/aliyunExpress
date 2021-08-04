//var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://root:Lw135246@dds-wz975fe96170f9241908-pub.mongodb.rds.aliyuncs.com:3717";

const MongoDB = require('mongodb');
const MongoClient = MongoDB.MongoClient;
const ObjectID = MongoDB.ObjectID;
// const CONFIG = {
//     dbUrl: 'mongodb://127.0.0.1:27017/',
//     dbName: 'test'
// };

class DB{
    constructor() {
        
        this.dbClient = '';
        this.connect();
    }
    connect(){
        let self = this;
        return new Promise(((resolve, reject) => {
            if(!self.dbClient){
                MongoClient.connect(url,{'useNewUrlParser': true, 'useUnifiedTopology':true},(err,client)=>{
                    if(err){
                        reject(err);
                    }else{
                        self.dbClient = client.db('lewei_admin');
                        resolve(self.dbClient);
                    }
                })
            }else{
                resolve(self.dbClient);
            }
        }))
    }
    insert(collectionName,jsonArr){
        if(!collectionName || !jsonArr || !(jsonArr instanceof Array)) throw '参数错误';
        return new Promise((resolve, reject) => {
            this.connect().then(db=>{
                const collect = db.collection(collectionName);
                collect.insertMany(jsonArr,(err,result)=>{
                    if(!err){
                        resolve(result);
                    }else{
                        reject(err);
                    }
                })
            })
        })
    }
    find(collectionName,json){
        if(!collectionName || !json ) throw '参数错误';
        return new Promise((resolve, reject) => {
            this.connect(collectionName).then( db=>{
                let result = db.collection(collectionName).find(json);
                result.toArray((err,data)=>{
                    if(!err){
                        resolve(data);
                    }else{
                        reject(err);
                    }
                })
            })
        })
    }
    findPage(collectionName,json,index,size){
        if(!collectionName || !json ) throw '参数错误';
        return new Promise((resolve, reject) => {
            this.connect(collectionName).then( db=>{
                let result = db.collection(collectionName).find(json).limit(size).skip(index);
                result.toArray((err,data)=>{
                    if(!err){
                        resolve(data);
                    }else{
                        reject(err);
                    }
                })
            })
        })
    }
    remove(collectionName,json){
        if(!collectionName || !json ) throw '参数错误';
        return new Promise(((resolve, reject) => {
            this.connect().then(db=>{
                const collection = db.collection(collectionName);
                collection.deleteOne(json,(err,result)=>{
                    if(!err){
                        resolve(result);
                    }else{
                        reject(err);
                    }
                })
            })
        }))
    }
    update(collectionName,filter,json){
        if(!collectionName || !filter || !json) throw '参数错误';
        return new Promise((resolve, reject) => {
            this.connect().then(db=>{
                const collection = db.collection(collectionName);
                collection.updateOne(filter,{$set:json},(err,result)=>{
                    if(!err){
                        resolve(result)
                    }else{
                        reject(err)
                    }
                })
            })
        })
    }
    getObjectId(id){    /*mongodb里面查询 _id 把字符串转换成对象*/
        return new ObjectID(id);
    }
}

module.exports = new DB()