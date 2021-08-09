exports.config ={
    environ_name : 'test-',
    env : 'test',
    //域名上的项目名, environ_name + app + lewei.life 构成完整域名
    apps :['live', 'pad', 'svideo', 'anchor', 'admin-api'],


    cfg : {
        'mongodb_url': `mongodb://root:Lw135246@dds-wz975fe96170f9241.mongodb.rds.aliyuncs.com:3717,
                        dds-wz975fe96170f9242.mongodb.rds.aliyuncs.com:3717/admin?replicaSet=mgset-46339342`,
        'server_ip_list': ['10.0.0.67']
    },
    redis_conf : {
        'host': 'r-wz9nomv8cuauf0t1t7.redis.rds.aliyuncs.com',
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
