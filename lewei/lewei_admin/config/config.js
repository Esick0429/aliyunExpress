module.exports ={
    environ_name : 'pre-',
    env : 'pre',
    //域名上的项目名, environ_name + app + lewei.life 构成完整域名
    apps :['live', 'pad', 'svideo', 'anchor', 'admin-api'],

    mongodb_url : 'mongodb://root:Lw135246@dds-wz910dc0d81316241219-pub.mongodb.rds.aliyuncs.com:3717,dds-wz910dc0d81316242592-pub.mongodb.rds.aliyuncs.com:3717/admin?replicaSet=mgset-46301842',
    redis_conf : {
        'host': 'r-wz9mea3oe6dlu55pnd.redis.rds.aliyuncs.com',
        'port': 6379,
        'password': 'Lw135246',
        //redis连接配置，命令执行超时时间、连接超时时间、执行超时重试
        'socket_timeout': 2,
        'socket_connect_timeout': 3,
        'retry_on_timeout': true,
        // 对执行结果解码
        'decode_responses': true
    }
}
