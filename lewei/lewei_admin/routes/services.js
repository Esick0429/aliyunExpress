const db = require('../db/mongo.js')
// const Long = require('mongodb').Long
const ObjectId = require('mongodb').ObjectId
const {
    encrypt,
    decrypt,
    passwordEncrypt
} = require('../db/token');
const {
    setRedis,
    delectRedis
} = require('../db/redis')

exports.pageing = (req, res) => {
    console.log(req.query)
    const skip = parseInt(req.body.pageIndex) - 1;
    const limit = parseInt(req.body.pageSize);
    db.pageing('live', 'anchor_info', skip, limit, {
        create_time: -1
    }, function (total, reslut) {
        // console.log(total,reslut);
        res.json({
            code: 0,
            data: {
                total: total,
                anchors: reslut
            }
        })
    });
}
exports.getRouter = async (req, res) => {
    let routerList = []
    let data = await db.findAll('lewei_admin', 'router_info', {
        deleted: false
    })
    for (let i of data.res) {
        routerList.push({
            routerId: i._id,
            routerName: i.router_name,
            config: i.config,
            createTime: i.create_time
        })
    }
    res.json({
        code: 0,
        data: {
            total: data.total,
            list: roleList
        },
        message: '成功'
    })
    console.log('查询成功')
}
exports.getRole = async (req, res) => {
    let value =await varify(req.headers.token)
    console.log(value,'varify');
    if (!value) {//权限校验
        return
    }

    let roleList = []
    let data = await db.findAll('lewei_admin', 'role_info', {
        deleted: false
    });
    for (let i of data.res) {
        roleList.push({
            router: {
                routerId: i.router_id,
                routerName: i.router_name,
            },
            roleId: i._id,
            roleName: i.role_name,
            create_time: i.create_time,
        })
    }
    res.json({
        code: 0,
        data: {
            total: data.total,
            list: roleList
        },
        message: '成功'
    })
    console.log('查询成功')
}
//新增角色
exports.addRole = async (req, res) => {
    let value =await varify(req.headers.token)
    console.log(value,'varify');
    if (!value) {//权限校验
        return
    }

    let routerInfo = req.body.checkList
    let roleName = req.body.roleName
    let routerId = []
    let routerName = []
    for (let i of routerInfo) {
        routerId.push(i.id)
        routerName.push(i.label)
    }
    var data = {
        router_id: routerId,
        role_name: roleName,
        router_name: routerName,
        deleted: false,
        create_time: new Date().getTime(),
        update_time: new Date().getTime()
    }
    await db.insertOne("lewei_admin", "role_info", data)
    res.json({
        code: 0,
        message: '成功'
    })
}


exports.dRole = async (req, res) => {
    let value =await varify(req.headers.token)
    console.log(value,'varify');
    if (!value) {//权限校验
        return
    }

    let id = req.body.id
    await db.dRole("lewei_admin", "role_info", {
        _id: ObjectId(id)
    }, {
        $set: {
            deleted: true
        }
    });
    res.json({
        code: 0,
        message: '成功'
    })
}


exports.updateInfo = async (req, res) => {
    let value =await varify(req.headers.token)
    console.log(value,'varify');
    if (!value) {//权限校验
        return
    }
    
    let id = req.body.id
    let routerInfo = req.body.checkList
    let roleName = req.body.roleName
    let updateTime = new Date().getTime()
    let routerId = []
    let routerName = []
    for (let i of routerInfo) {
        routerId.push(i.id)
        routerName.push(i.label)
    }
    await db.updateInfo("lewei_admin", "role_info", {
        _id: ObjectId(id)
    }, {
        $set: {
            router_name: routerName,
            router_id: routerId,
            role_name: roleName,
            update_time: updateTime
        }
    });
    res.json({
        code: 0,
        message: '成功'
    })
}

//用户
exports.login = async (req, res) => {

    console.log(req.body);
    let userphone = req.body.userphone
    let password = req.body.password

    let data = await db.find('lewei_admin', 'user_info', {deleted: false,banned:false,phone: userphone},{})
    console.log(data[0]);
    if (data[0]) { //验证账号
        let newpass = passwordEncrypt(password)
        console.log(newpass)
        if (newpass == data[0].password) { //验证密码

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
            let key = `zero_admin_token:${data[0].user_id}:admin-api`
            console.log(key);
            setRedis(key, token, function (value) {
                console.log(value)
                res.json({
                    "code": 0,
                    "data": token,
                    "message": '成功'
                })
            })
        } else {
            res.end('密码错误')
        }
    } else {
        res.end('账号不存在')
    }
}
//用户退出
exports.quit = (req, res) => {
    //console.log(req.headers);
    delectRedis(req.headers.token, function (value) {
        console.log(value);
        res.json({
            "code": 0,
            "data": null,
            "message": '成功'
        })
    })

}
//路由
exports.router =async (req, res) => {

    //console.log(req.headers);
    //let domain = req.headers.domain
    let token = req.headers.token
    let user = JSON.parse(decrypt(token)) //解析token获取userId

    //获取router
    console.log(user.userId);
    let users = await db.find('lewei_admin', 'user_info', {deleted: false,user_id: user.userId}, {create_time: 1}) //查询roleId
    console.log(users[0]);
    let role =await db.find('lewei_admin', 'role_info', {deleted: false,_id: ObjectId(users[0].role_id)}, {create_time: 1}) //通过roleId查询routerId
    console.log(role[0]);
    let arr = role[0].router_id
    var data = []
    const pp = new Promise(async (resolve, reject) => {
        for (var i = 0; i < arr.length; i++) {
            let res= await db.find('lewei_admin', 'router_info', {_id: ObjectId(arr[i])}, {create_time: 1}) //查找router——config
            if (res[0].router_name == '首页' || res[0].router_name == '首页(c)') {
                data.splice(0, 0, res[0])
            } else {
                data.push(res[0])
            }

            if (data.length == arr.length) {
                resolve(data)
            }
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
        res.json({
            "code": 0,
            "data": {
                routerList: result
            },
            "message": '成功'
        })
    })    
    
}
//新建用户
exports.addUser =async (req, res) => {
    let value =await varify(req.headers.token)
    console.log(value,'varify');
    if (!value) {//权限校验
        return
    }

    let userphone = req.body.userphone
    let reg = /^1(3[0-9]|4[01456879]|5[0-35-9]|6[2567]|7[0-8]|8[0-9]|9[0-35-9])\d{8}$/
    console.log(reg.test(userphone))
    if (!reg.test(userphone)) { //验证手机号
        return
    }
    console.log(userphone);


    let data =await db.findAll('lewei_admin', 'user_info', {deleted: false,phone: userphone})
    console.log(data);
    if (data[0]) { ///判断手机号是否存在
        console.log('手机号已注册');
        res.json({
            code: 0,
            data: null,
            message: '手机号已注册'
        })
    } else {

        //创建用户
        let user = {}
        user.avatar = req.body.avatar
        user.username = req.body.username
        user.sex = req.body.sex
        user.phone = userphone
        user.password = passwordEncrypt(req.body.password)
        user.role_id = req.body.role
        user.roleName = req.body.roleName
        user.deleted = false
        user.banned = false
        user.create_time = (new Date()).getTime()
        user.update_time = (new Date()).getTime()
        user._id = ObjectId()
        user.user_id = user._id.toString()
        console.log(user);

        //插入
        let result = await db.insertOne("lewei_admin", "user_info", user)
        console.log(result);
        res.json({
            code: 0,
            data: null,
            message: '成功'
        })
    }
    
}
//用户列表
exports.getUser = async (req, res) => {
    console.log(req.query);
    let value =await varify(req.headers.token)
    console.log(value,'varify');
    if (!value) {//权限校验
        return
    }
    let pageSize = Number(req.query.pageSize) ? Number(req.query.pageSize) : 10
    let pageIndex = (Number(req.query.pageIndex) - 1) * pageSize ? (Number(req.query.pageIndex) - 1) * pageSize : 0
    console.log(pageSize, pageIndex);
    var {total,reslut}= await db.pageing('lewei_admin', 'user_info', {deleted: false}, pageIndex, pageSize, {create_time: -1})
    console.log(total, reslut);
    res.json({code: 0,data: {total: total,data: reslut}}) 
}
//用户删除
exports.dUser =async (req, res) => { //删除
    console.log(req.path);
    let value =await varify(req.headers.token)
    console.log(value,'varify');
    if (!value) {//权限校验
        return
    }

    var user_id = req.path.substr(1)
    console.log(user_id);
    let result = await db.updateInfo("lewei_admin", "user_info", {'user_id': user_id}, {$set: {'deleted': true,'update_time': (new Date()).getTime()}})
    console.log(result);
    res.json({
        "code": 0,
        "data": null,
        "message": '成功'
    }) //
        //res.end(JSON.stringify({"code":0,"data":null,"message":'成功'})) 
}
//编辑用户
exports.updateUser =async (req, res) => {
    let value =await varify(req.headers.token)
    console.log(value,'varify');
    if (!value) {//权限校验
        return
    }

    let userId = req.path.substr(8)
    console.log(userId);
    console.log(req.body)
    //用户
    let user = {}
    user.avatar = req.body.avatar
    user.username = req.body.username
    user.sex = req.body.sex
    user.phone = req.body.userphone
    if(req.body.password){
        user.password = passwordEncrypt(req.body.password)
    }
    user.banned = req.body.banned? req.body.banned : false
    user.role_id = req.body.role
    user.roleName = req.body.roleName
    user.update_time = (new Date()).getTime()
    console.log(user);

    //更新
    let result = await db.updateInfo("lewei_admin", "user_info", {'user_id': userId}, {$set: user})
    console.log(result);
    res.json({
        "code": 0,
        "data": null,
        "message": '成功'
    }) //
}

//超管权限验证
var varify =async function(data){
    
    let user = JSON.parse(decrypt(data))
    let result = await db.find("lewei_admin", "user_info",{deleted:false,user_id:user.userId},{})
    console.log(result[0],'yz');
    if (result[0].user_id =='6110987a70dba80808074d64' || result[0].user_id == '61126850a12dd55b096dbfb1') {
        return true
    }else{
        return false
    }
}