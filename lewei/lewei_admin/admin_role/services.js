const db = require('./db.js.js.js')
// const Long = require('mongodb').Long
const ObjectId = require('mongodb').ObjectId
exports.pageing = (req,res)=>{
  console.log(req.query)
  const skip = parseInt(req.body.pageIndex)-1;
  const limit = parseInt(req.body.pageSize);
  db.pageing('live','anchor_info',skip,limit,{create_time: -1},function(total,reslut) {
      // console.log(total,reslut);
      res.json({code:0,data:{total:total,anchors:reslut}})
  });
}
exports.getRouter = (req,res) =>{
    let routerList = []
    db.findAll('lewei_admin','router_info',{deleted:false},function(total,data){
         for( let i of data){
            routerList.push({
                    routerId: i._id,
                    routerName: i.router_name,
                    config: i.config,
                    createTime: i.create_time
            })
        }
        res.json({code:0,data:{total:total,list:routerList},message:'成功'})
    })
}
exports.getRole = (req,res)=>{
    let roleList = []
    db.findAll('lewei_admin','role_info',{deleted:false},function(total,data) {
        console.log(data)
        for( let i of data){
            roleList.push({
                router: 
                        {
                            routerId: i.router_id,
                            routerName:i.router_name,
                        }
                        ,
                roleId: i._id,
                roleName: i.role_name,
                create_time:i.create_time,
            })
        }
        res.json({code:0,data:{total:total,list:roleList},message:'成功'})
        console.log('查询成功')
    })
}
//新增角色
exports.addRole = (req,res)=>{
  let routerInfo = req.body.checkList
  let roleName = req.body.roleName
  let routerId = []
  let routerName = []
    for(let i of routerInfo){
        routerId.push(i.id)
        routerName.push(i.label)
    }
  var data={
    router_id:routerId,
    role_name:roleName,
    router_name:routerName,
    deleted:false,
    create_time:new Date().getTime(),
    update_time:new Date().getTime()
  }
  db.insertOne("lewei_admin","role_info",data,function(result){
    res.json({code:0,message:'成功'})
  })
}


exports.dRole = (req,res)=>{
    let id = req.body.id
   db.updateInfo("lewei_admin","role_info",{_id:ObjectId(id)},{$set:{deleted:true}},function(result){
       res.json({code:0,message:'成功'})
    });
}


exports.updateInfo = (req,res)=>{
    let id = req.body.id
    let routerInfo = req.body.checkList
    let roleName = req.body.roleName
    let updateTime = new Date().getTime()
    let routerId = []
    let routerName = []
     for(let i of routerInfo){
        routerId.push(i.id)
        routerName.push(i.label)
    }
   db.updateInfo("lewei_admin","role_info",{_id:ObjectId(id)},{$set:{router_name:routerName,router_id:routerId,role_name:roleName,update_time:updateTime}},function(result){
       res.json({code:0,message:'成功'})
    });
}