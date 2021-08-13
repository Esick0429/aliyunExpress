const db = require('../db/db.js')
// const Long = require('mongodb').Long
const ObjectId = require('mongodb').ObjectId
const { encrypt, decrypt, passwordEncrypt } = require('../db/token');
const { setRedis, delectRedis } = require('../db/redis')

exports.pageing = (req, res) => {
    console.log(req.query)
    const skip = parseInt(req.body.pageIndex) - 1;
    const limit = parseInt(req.body.pageSize);
    db.pageing('live', 'anchor_info', skip, limit, { create_time: -1 }, function (total, reslut) {
        // console.log(total,reslut);
        res.json({ code: 0, data: { total: total, anchors: reslut } })
    });
}
exports.getRouter = (req, res) => {
    let routerList = []
    db.findAll('lewei_admin', 'router_info', { deleted: false }, function (total, data) {
        for (let i of data) {
            routerList.push({
                routerId: i._id,
                routerName: i.router_name,
                config: i.config,
                createTime: i.create_time
            })
        }
        res.json({ code: 0, data: { total: total, list: routerList }, message: '成功' })
    })
}
exports.getRole = (req, res) => {
    let roleList = []
    db.findAll('lewei_admin', 'role_info', { deleted: false }, function (total, data) {
        for (let i of data) {
            roleList.push({
                router:
                {
                    routerId: i.router_id,
                    routerName: i.router_name,
                }
                ,
                roleId: i._id,
                roleName: i.role_name,
                create_time: i.create_time,
            })
        }
        res.json({ code: 0, data: { total: total, list: roleList }, message: '成功' })
        console.log('查询成功')
    })
}
//新增角色
exports.addRole = (req, res) => {
    let routerId = req.body.checkList
    let roleName = req.body.roleName
    let routerName = []
    for (let i = 0; i < routerId.length; i++) {
        db.findAll('lewei_admin', 'router_info', { _id: ObjectId(routerId[i]) }, function (total, data) {
            let rrr = data
            // console.log(rrr)
            for (let j of rrr) {
                console.log(j)
                routerName.push(j.router_name)
            }
            if (i === routerId.length - 1) {
                var data = {
                    router_id: routerId,
                    role_name: roleName,
                    router_name: routerName,
                    deleted: false,
                    create_time: new Date().getTime(),
                    update_time: new Date().getTime()
                }
                db.insertOne("lewei_admin", "role_info", data, function (result) {
                    res.json({ code: 0, message: '成功' })
                })
            }
        })
    }
}


exports.dRole = (req, res) => {
    let id = req.body.id
    db.findAll('lewei_admin','user_info',{role_id:{$in:[id]},deleted:false},function(total,data){
        console.log(total,data)
        if(total==0){
            db.updateInfo("lewei_admin", "role_info", { _id: ObjectId(id) }, { $set: { deleted: true } }, function (result) {
                res.json({ code: 0, message: '成功' })
            });
        }else{
            res.json({code:500,message:'此角色有关联用户，请先删除关联用户'})
        }
    })
}


exports.updateInfo = (req, res) => {
    let id = req.body.id
    if (id == '6110cf1cee4a024d7959e564' && id == '6112648152289de8fdaf9be6') {
        res.json({ code: 400, message: '参数不合法' })
    } else {
        let routerId = req.body.checkList
        let roleName = req.body.roleName
        let updateTime = new Date().getTime()
        let routerName = []
        for (let i = 0; i < routerId.length; i++) {
            db.findAll('lewei_admin', 'router_info', { _id: ObjectId(routerId[i]) }, function (total, data) {
                let rrr = data
                // console.log(rrr)
                for (let j of rrr) {
                    console.log(j)
                    routerName.push(j.router_name)
                }
                if (i === routerId.length - 1) {
                    db.updateInfo("lewei_admin", "role_info", { _id: ObjectId(id) }, { $set: { router_name: routerName, router_id: routerId, role_name: roleName, update_time: updateTime } }, function (result) {
                        res.json({ code: 0, message: '成功' })
                    });
                }
            })
        }
    }
}

//用户
exports.login = (req, res) => {

    console.log(req.body);
    let userphone = req.body.userphone
    let password = req.body.password

    db.findAll('lewei_admin', 'user_info', { deleted: false, phone: userphone }, function (total, data) {
        console.log(data[0]);
        if (data[0]) {//验证账号
            let newpass = passwordEncrypt(password)
            console.log(newpass)
            if (newpass == data[0].password) {//验证密码

                let tokendata = {}
                tokendata.userId = data[0].user_id
                tokendata.appId = 'admin-api'
                tokendata.loginTime = String((new Date()).getTime())
                tokendata = JSON.stringify(tokendata)
                console.log(tokendata);

                //创建token
                let token = encrypt(tokendata)
                console.log(token);

                //存入token到redis
                console.log(userphone)

                let key = `zero_admin_token:${data[0].user_id}:admin-api`
                console.log(key);
                setRedis(key, token, function (value) {
                    console.log(value)
                    res.json({ "code": 0, "data": token, "message": '成功' })
                })
            }
            else {
                res.end('密码错误')
            }
        }
        else {
            res.end('账号不存在')
        }
    })

}
//用户退出
exports.quit = (req, res) => {
    console.log(req.headers);
    delectRedis(req.headers.token, function (value) {
        console.log(value);
        res.json({ "code": 0, "data": null, "message": '成功' })
    })

}
//路由
exports.router = (req, res) => {

    console.log(req.headers);
    //let domain = req.headers.domain
    let token = req.headers.token
    let user = JSON.parse(decrypt(token))//解析token获取userId

    //获取router
    console.log(user.userId);
    db.find('lewei_admin', 'user_info', { deleted: false, user_id: user.userId }, { create_time: 1 }, function (user) {//查询roleId
        console.log(user[0]);
        db.find('lewei_admin', 'role_info', { deleted: false, _id: ObjectId(user[0].role_id) }, { create_time: 1 }, function (role) { //通过roleId查询routerId
            console.log(role[0]);
            let arr = role[0].router_id
            var data = []
            const pp = new Promise((resolve, reject) => {
                for (var i = 0; i < arr.length; i++) {
                    db.find('lewei_admin', 'router_info', { _id: ObjectId(arr[i]) }, { create_time: 1 }, function (res) {//查找router——config
                        console.log(res);
                        if (res[0].router_name == '首页' || res[0].router_name == '首页(c)') {
                            data.splice(0, 0, res[0])
                        } else {
                            data.push(res[0])
                        }
                        if (data.length == arr.length) {
                            resolve(data)
                        }
                    })
                }
            })

            pp.then((data) => {
                console.log(data, '22');
                var result = []
                for (let index = 0; index < data.length; index++) {
                    let object = {}
                    object.routerName = data[index].router_name;
                    object.config = data[index].config[0]
                    console.log(object);
                    result.push(object)
                }
                res.json({ "code": 0, "data": { routerList: result }, "message": '成功' })
            })
        })
    })
}
//新建用户
exports.addUser = (req, res) => {
    let userphone = req.body.userphone
    let reg = /^1(3[0-9]|4[01456879]|5[0-35-9]|6[2567]|7[0-8]|8[0-9]|9[0-35-9])\d{8}$/
    console.log(reg.test(userphone))
    if (!reg.test(userphone)) { //验证手机号
        return
    }
    console.log(userphone);


    db.findAll('lewei_admin', 'user_info', { deleted: false, phone: userphone }, function (total, data) {
        console.log(data);
        if (data[0]) { ///判断手机号是否存在
            console.log('手机号已注册');
            res.json({ code: 0, data: null, message: '手机号已注册' })
        } else {

            //创建用户
            let user = {}
            user.avatar = req.body.avatar
            user.username = req.body.username
            user.sex = req.body.sex
            user.phone = userphone
            user.password = passwordEncrypt(req.body.password)
            user.role_id = req.body.role
            user.deleted = false
            user.banned = false
            user.create_time = (new Date()).getTime()
            user.update_time = (new Date()).getTime()
            user._id = ObjectId()
            user.user_id = user._id.toString()
            console.log(user);

            //插入
            db.insertOne("lewei_admin", "user_info", user, function (result) {
                console.log(result);
                res.json({ code: 0, data: null, message: '成功' })
            })


        }
    })
}
//用户列表
exports.getUser = (req, res) => {
    console.log(req.query);
    let pageSize = Number(req.query.pageSize) ? Number(req.query.pageSize) : 10
    let pageIndex = (Number(req.query.pageIndex) - 1) * pageSize ? (Number(req.query.pageIndex) - 1) * pageSize : 0
    console.log(pageSize, pageIndex);
    db.pageing('lewei_admin', 'user_info', { deleted: false }, pageIndex, pageSize, { create_time: -1 }, function (total, reslut) {
        console.log(total, reslut);
        res.json({ code: 0, data: { total: total, data: reslut } })
    });
}
//用户删除
exports.dUser = (req, res) => {//删除
    console.log(req.path);
    var user_id = req.path.substr(1)
    console.log(user_id);
    db.updateInfo("lewei_admin", "user_info", { 'user_id': user_id }, { $set: { 'deleted': true, 'update_time': (new Date()).getTime() } }, function (result) {
        console.log(result);
        res.json({ "code": 0, "data": null, "message": '成功' }) //
        //res.end(JSON.stringify({"code":0,"data":null,"message":'成功'})) 
    });

}
//编辑用户
exports.updateUser = (req, res) => {
    let userId = req.path.substr(8)
    console.log(userId);
    console.log(req.body)
    //用户
    let user = {}
    user.avatar = req.body.avatar
    user.username = req.body.username
    user.sex = req.body.sex
    user.phone = req.body.userphone
    user.password = passwordEncrypt(req.body.password)
    user.role_id = req.body.role
    user.update_time = (new Date()).getTime()
    console.log(user);

    //更新
    db.updateInfo("lewei_admin", "user_info", { 'user_id': userId }, { $set: user }, function (result) {
        console.log(result);
        res.json({ "code": 0, "data": null, "message": '成功' }) //
        //res.end(JSON.stringify({"code":0,"data":null,"message":'成功'})) 
    });
}
