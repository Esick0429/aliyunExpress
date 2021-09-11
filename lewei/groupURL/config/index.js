const url = "mongodb://root:Lw135246@dds-wz975fe96170f9241908-pub.mongodb.rds.aliyuncs.com:3717,dds-wz975fe96170f9242412-pub.mongodb.rds.aliyuncs.com:3717/admin?replicaSet=mgset-46339342" 
 

// MongoDB数据库配置文件
const config = {
    // 定义数据库地址
    'dbUrl' : url,
    // 定义数据库名字
    'dbName' : 'we_chat'
  };
  
module.exports = config