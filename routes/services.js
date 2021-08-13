const db = require('../db/db.js')
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
exports.getRouter =async (req,res) =>{
    let routerList = []
    let data = await db.findAll('lewei_admin','router_info',{deleted:false})
    for( let i of data.res){
        routerList.push({
                routerId: i._id,
                routerName: i.router_name,
                config: i.config,
                createTime: i.create_time
        })
    }
    res.json({code:0,data:{total:data.total,list:roleList},message:'成功'})
    console.log('查询成功')
}
exports.getRole = async (req,res)=>{
    let roleList = []
    let data = await db.findAll('lewei_admin','role_info',{deleted:false});
    for( let i of data.res){
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
    res.json({code:0,data:{total:data.total,list:roleList},message:'成功'})
    console.log('查询成功')
}
//新增角色
exports.addRole =async (req,res)=>{
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
    await db.insertOne("lewei_admin","role_info",data)
    res.json({code:0,message:'成功'})
}


exports.dRole =async (req,res)=>{
    let id = req.body.id
    await db.dRole("lewei_admin","role_info",{_id:ObjectId(id)},{$set:{deleted:true}});
    res.json({code:0,message:'成功'})
}


exports.updateInfo =async (req,res)=>{
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
    await db.updateInfo("lewei_admin","role_info",{_id:ObjectId(id)},{$set:{router_name:routerName,router_id:routerId,role_name:roleName,update_time:updateTime}});
    res.json({code:0,message:'成功'})
}