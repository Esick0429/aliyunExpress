var db = require('./mongo')
var {decrypt} = require('./token_util')
const ObjectId = require('mongodb').ObjectId

class Verief{
    constructor(){
        
    }
    async authen(url,token,id){
        if(!url || !token ||!id) throw '参数错误'
        let newToken = JSON.parse(decrypt(token))
        let userId = newToken.userId
        console.log(userId)


        try{
            let user = await db.find(url,'lewei_admin','user_info',{user_id:userId},{})
            console.log(user)
            let ro = await db.find(url,'lewei_admin','role_info',{_id:ObjectId(user[0].role_id)},{})
            let role = ro[0].router_id
            let router = await db.find(url,'lewei_admin', 'router_info', {}, {}) //查找router
            for (var j = 0; j < role.length; j++) {
                for (var i = 0; i < router.length; i++) {
                    if(id === router[i]._id.toString() && role[j] === id){
                        return true
                    }
                }
            }
            if(j === role.length && i === router.length){
                return false
            }
            
        }catch(err){
            console.log(err)
            return false
        }
    }
}
module.exports = new Verief()