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
            list: routerList
        },
        message: '成功'
    })
    console.log('查询成功')
}
exports.getRole = async (req, res) => {
    // let value =await varify(req.headers.token)
    // console.log(value,'varify');
    // if (!value) {//权限校验
    //     return
    // }
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
    // let value =await varify(req.headers.token)
    // console.log(value,'varify');
    // if (!value) {//权限校验
    //     return
    // }
    if(!req.body.checkList){
        res.json({code:400,message:'参数错误'})
        return
    }
    if(!req.body.roleName){
        res.json({code:400,message:'参数错误'})
        return
    }
    let routerId = req.body.checkList
    let roleName = req.body.roleName
    let routerName = []
    for (let i of routerId) {
        let data = await db.findAll('lewei_admin', 'router_info', { _id: ObjectId(i) })
        routerName.push(data.res[0].router_name)
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
    if (id === '6110cf1cee4a024d7959e564' && id === '6112648152289de8fdaf9be6') {
        res.json({ code: 400, message: '参数不合法' })
    }else{
    let data = await db.findAll('lewei_admin','user_info',{role_id:{$in:[id]},deleted:false})
    if(data.total === 0){
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
    }else{res.json({code:500,message:'此角色有关联用户，请先删除关联用户'})}
    }
}


exports.updateInfo = async (req, res) => {
    let id = req.body.id
    console.log(id);
    if(!req.body.checkList){
        res.json({code:400,message:'参数错误'})
        return
    }
    if(!req.body.roleName){
        res.json({code:400,message:'参数错误'})
        return
    }
    if (id === '6110cf1cee4a024d7959e564' && id === '6112648152289de8fdaf9be6') {
        res.json({ code: 400, message: '参数不合法' })
    }else{
    let routerId = req.body.checkList
    let roleName = req.body.roleName
    let updateTime = new Date().getTime()
    let routerName = []
    for (let i of routerId) {
        let data = await db.findAll('lewei_admin', 'router_info', { _id: ObjectId(i) })
        routerName.push(data.res[0].router_name)
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
}



exports.getUserInfo  = async (req,res) => {
    const token = req.headers.token
    const user = JSON.parse(decrypt(token))
    console.log(user);
    const userId = user.userId
    let data = await db.findAll('lewei_admin','user_info',{_id:ObjectId(userId)})
    res.json({code:0,data:{total:data.total,reslut:data.res},message:'成功'})
    
}

exports.changePassword = async (req,res) =>{
    const token = req.headers.token
    const user = JSON.parse(decrypt(token))
    const userId = user.userId
    console.log(userId)
    if(!req.body.oldPass || !req.body.checkPass || req.body.oldPass > 30 || req.body.checkPass < 6){
        res.json({code:400,message:'参数错误'})
        return
    }
    if(req.body.oldPass === req.body.checkPass){
        res.json({code:400,message:'参数错误'})
        return
    }
    const oldPwd = passwordEncrypt(req.body.oldPass)
    const newPwd = passwordEncrypt(req.body.checkPass)
    let data = await db.findAll('lewei_admin','user_info',{_id:ObjectId(userId)})
    if(oldPwd !== data.res[0].password){
        res.json({code:400,message:'原密码错误'})
    }else{
        db.updateInfo('lewei_admin','user_info', { _id: ObjectId(userId) }, { $set:{password:newPwd}})
        res.json({code:0,message:'修改成功'})
    }
}









//用户
exports.login = async (req, res) => {

    console.log(req.body)
    let userphone = req.body.userphone
    let password = req.body.password

    let data = await db.find('lewei_admin', 'user_info', {deleted: false,banned:false,phone: userphone},{})
    console.log(data[0])
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
            res.json({code:4444,message:'密码错误'})
        }
    } else {
        res.json({code:4444,message:'账号不存在'})
    }
}
//用户退出
exports.quit = (req, res) => {
    //console.log(req.headers);
    delectRedis(req.headers.token, function (value) {
        console.log(value)
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
    var data = new Array(4)
    const pp = new Promise(async (resolve, reject) => {
        for (var i = 0; i < arr.length; i++) {
            let res= await db.find('lewei_admin', 'router_info', {_id: ObjectId(arr[i])}, {create_time: 1}) //查找router——config
            switch (res[0].router_name) {
                case '首页':
                    data[0] = res[0]
                    break
                case '学学':
                    data[1] = res[0]
                    break
                case '内容':
                    data[2] = res[0]
                    break
                case '运营':
                    data[3] = res[0]
                    break
                default:
                    break
            }
            var list = data.filter((item)=>{
                return item
            })
            console.log(list,'sjkfhsksfghfslf')

            if (list.length === arr.length) {
                resolve(list)
            }
        }
    })

    pp.then((data) => {
        console.log(data, '22');
        var result = []
        for (let index = 0; index < data.length; index++) {
            let object = {}
            object.routerName = data[index].router_name
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
    console.log(value,'varify')
    if (!value) {//权限校验
        return
    }

    let userphone = req.body.userphone
    let reg = /^1(3[0-9]|4[01456879]|5[0-35-9]|6[2567]|7[0-8]|8[0-9]|9[0-35-9])\d{8}$/
    console.log(reg.test(userphone))
    if (!reg.test(userphone)) { //验证手机号
        res.json({code:400,message:'参数错误'})
        return
    }
    if(!req.body.username || req.body.username.length > 30){
        res.json({code:400,message:'参数错误'})
        return
    }
    if(!req.body.password || req.body.password.length > 30 || req.body.password.length < 6){
        res.json({code:400,message:'参数错误'})
        return
    }
    if(!req.body.sex || req.body.sex !== '男' || req.body.sex !== '女'){
        res.json({code:400,message:'参数错误'})
        return
    }
    let roleList =await db.findAll('lewei_admin','role_info',{deleted: false,_id:ObjectId(req.body.role)})
    if(!req.body.role || !roleList[0]){
        res.json({code:400,message:'参数错误'})
        return
    }
    if(!req.body.roleName || roleList[0].role_name !== req.body.roleName){
        res.json({code:400,message:'参数错误'})
        return
    }
    

    let data =await db.findAll('lewei_admin', 'user_info', {deleted: false,phone: userphone})
    console.log(data);
    if (data[0]) { ///判断手机号是否存在
        console.log('手机号已注册');
        res.json({
            code: 4444,
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
        console.log(user)

        //插入
        let result = await db.insertOne("lewei_admin", "user_info", user)
        console.log(result)
        res.json({
            code: 0,
            data: null,
            message: '成功'
        })
    }
    
}
//用户列表
exports.getUser = async (req, res) => {
    console.log(req.query)
    let value =await varify(req.headers.token)
    console.log(value,'varify')
    if (!value) {//权限校验
        return
    }
    let filter ={  //筛选条件
        'deleted': false
    }
    if(req.query.username && req.query.username !== 'null'){
        filter.username = {'$regex':req.query.username}
    }
    else if(req.query.banned && req.query.banned !== 'null'){
        filter.banned = (req.query.banned === 'true')
    } 
    console.log(filter)
    let pageSize = Number(req.query.pageSize) ? Number(req.query.pageSize) : 10
    let pageIndex = (Number(req.query.pageIndex) - 1) * pageSize ? (Number(req.query.pageIndex) - 1) * pageSize : 0
    console.log(pageSize, pageIndex);
    var data = await db.pageing('lewei_admin', 'user_info', filter, pageIndex, pageSize, {create_time: -1})
    console.log(data.total, data.res);
    res.json({code: 0,data: {total: data.total,data: data.res}}) 
}
//用户删除
exports.dUser =async (req, res) => { //删除
    console.log(req.path);
    let value =await varify(req.headers.token)
    console.log(value,'varify')
    if (!value) {//权限校验
        return
    }

    var user_id = req.path.substr(1)
    console.log(user_id)
    if(user_id === '6110cf1cee4a024d7959e564'){
        res.json({"code": 0,"message": '没有权限'})
        return
    }
    let result = await db.updateInfo("lewei_admin", "user_info", {'user_id': user_id}, {$set: {'deleted': true,'update_time': (new Date()).getTime()}})
    console.log(result)
    res.json({
        "code": 0,
        "data": null,
        "message": '成功'
    }) //
        //res.end(JSON.stringify({"code":0,"data":null,"message":'成功'})) 
}
//编辑用户
exports.updateUser = async (req, res) => {
    let value =await varify(req.headers.token)
    console.log(value,'varify')
    if (!value) {//权限校验
        return
    }
    let userphone = req.body.userphone
    let reg = /^1(3[0-9]|4[01456879]|5[0-35-9]|6[2567]|7[0-8]|8[0-9]|9[0-35-9])\d{8}$/
    console.log(reg.test(userphone))
    if (!reg.test(userphone)) { //验证手机号
        res.json({code:400,message:'参数错误'})
        return
    }
    if(!req.body.username || req.body.username.length > 30){
        res.json({code:400,message:'参数错误'})
        return
    }
    if(!req.body.password || req.body.password.length > 30 || req.body.password.length < 6){
        res.json({code:400,message:'参数错误'})
        return
    }
    if(!req.body.sex || req.body.sex !== '男' || req.body.sex !== '女'){
        res.json({code:400,message:'参数错误'})
        return
    }
    let roleList =await db.findAll('lewei_admin','role_info',{deleted: false,_id:ObjectId(req.body.role)})
    if(!req.body.role || !roleList[0]){
        res.json({code:400,message:'参数错误'})
        return
    }
    if(!req.body.roleName || roleList[0].role_name !== req.body.roleName){
        res.json({code:400,message:'参数错误'})
        return
    }


    let userId = req.path.substr(8)
    console.log(userId)
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
    console.log(result)
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
    console.log(result,'yz');
    let role = await db.find("lewei_admin", "role_info",{deleted:false,_id:ObjectId(result[0].role_id)},{})
    console.log(role[0])
    if (role[0]._id.toString() === '6110cf1cee4a024d7959e564' || role[0]._id.toString() === '6112648152289de8fdaf9be6') {
        return true
    }else{
        return false
    }
}