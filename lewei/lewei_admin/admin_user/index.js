var getRawBody = require('raw-body');
var getFormBody = require('body/form');
var body = require('body');
var mongodb = require('./config/config')
var { encrypt,decrypt } =  require( './config/token');
const mongodb = require('../util/mongodb');


/* GET home page. */
exports.handler = (req, resp, context) => {
  getRawBody(req,async function(err,body){
    let data = Buffer.from(JSON.parse(body)).toString()
    console.log(data)
    console.log(req.path,req.method,req.queries,req.query,body)
    resp.setHeader('content-type', 'application/json')
    if(req.path == '/login' && req.method == 'POST'){
      var keyStr = '9Dvss22KnWSG/z+l/yM6JkB9adtwEoF8'
      var ivStr = 'fffddf1968735720' 
      var token = "G7YS2JJXV3LDJCUZ4UTXIAR5SQWSV5Z3MTWIHB6BLOW43OVSV7TEDVNNJBDLE6Q6LWFPTUXJG3JSO37BEZ526OUZQQGD7LRM2BKE26Q="
      //let data = "{userId:'12323',logintime:2134}"
      //var token = encrypt()
      let se = decrypt(keyStr,ivStr,token)
      console.log(se);
      let ss = encrypt(keyStr,ivStr,se)
      console.log(ss);
      //console.log(se==token1);
      res.send(se)
    }
    else if(req.path == '/*/update' && req.method == 'POST'){
      console.log(req.path);
      console.log(req.body);
      let userId = req.path.substr(6,24)
      console.log(userId);
      let user = {}
      user.avatar = req.body.avatar
      user.username = req.body.username
      user.sex = req.body.sex
      user.phone = req.body.userphone
      user.password = req.body.password
      user.role_id = req.body.role
      console.log((new Date()).getTime());
      user.update_time = (new Date()).getTime()
      console.log(user);
      let data = await mongodb.update('user_info',{'user_id':userId},user)
      console.log(data);
      res.end(JSON.stringify({"code":0,"data":null,"message":'成功'}))
    }
    else if (req.path == '/list' && req.method == 'GET') {
        console.log(req.queries)
        let pageSize = Number(req.queries.pageSize)
        let pageIndex = (Number(req.queries.pageIndex)-1)*pageSize
        let data = await mongodb.findPage('user_info',{'deleted':false},pageIndex,pageSize)
        //let data = await mongodb.find('user_info',{'deleted':false})
        for(var i=0;i<data.length;i++){
            delete data[i].password
        }
        console.log(data);
        resp.setHeader('content-type', 'application/json')
        resp.send(JSON.stringify({"code":0,"data":data,"message":'成功'}))
    }
    else if(req.path == '/create' && req.method == 'POST'){
        let userphone = body.userphone
        let phe = await mongodb.find('user_info',{"phone":userphone})
        console.log(phe[0]);
        if(phe[0]){
            res.send('手机号已注册')
            return
        }
        let user = {}
        user.avatar = body.avatar
        user.username = body.username
        user.sex = body.sex
        user.phone = userphone
        user.password = body.password
        user.role_id = body.role
        user.deleted = false
        user.banned = false
        console.log((new Date()).getTime());
        user.create_time = (new Date()).getTime()
        user.update_time = (new Date()).getTime()
        console.log(user);
        let data1 = await mongodb.insert('user_info',[user])
        console.log(data1);
        let id = await mongodb.find('user_info',{'phone':userphone})
        //console.log(id[0]._id.toString());
        let userId = id[0]._id.toString()
        //console.log(typeof(id[0]._id.toString()));
        let data = await mongodb.update('user_info',{'phone':userphone},{'user_id':userId}) //插入userId
        console.log(data);
        //res.writeHead(200,{'Content-Type':'application/json'});
        res.end(JSON.stringify({"code":0,"data":null,"message":'成功'}))
    }
    else if (req.path == '/*' && req.method == 'DELETE'){
      var user_id = req.path.substr(6)
      console.log(user_id);
      let data = await mongodb.update('user_info',{'user_id':user_id},{'deleted':true,'update_time':(new Date()).getTime()})
      console.log(data);
      res.end(JSON.stringify({"code":0,"data":null,"message":'成功'})) 
    }
    else if(req.path == '/quit' && req.method == 'POST'){
      res.end('退出成功')
    }
    else{
      resp.send('路由错误')
    }
  });
}

router.post('/user/login', function(req, res, next) {
  var keyStr = '9Dvss22KnWSG/z+l/yM6JkB9adtwEoF8'
  var ivStr = 'fffddf1968735720' 
  var token = "G7YS2JJXV3LDJCUZ4UTXIAR5SQWSV5Z3MTWIHB6BLOW43OVSV7TEDVNNJBDLE6Q6LWFPTUXJG3JSO37BEZ526OUZQQGD7LRM2BKE26Q="
  // console.log(token.length);
  // let m = Math.floor(token.length/8)
  // console.log(8-(token.length-m*8));
  // token = token+'='
  // console.log(token);
  // base32.decode(token);
  // console.log(base32.encode('test'));
  // console.log(base32.decode(token));
  //let es = encrypt(data,keyStr,ivStr)
  // let token1 = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(token));
  // console.log(token1);
  // let token2 = CryptoJS.enc.Base64.parse(token1).toString(CryptoJS.enc.Utf8)
  // console.log(token2);
  //let s = decryption(token)
  //let s = decrypt(token,keyStr,ivStr)
//console.log(s);
  //console.log(typeof(s));
  

  //let data = "{userId:'12323',logintime:2134}"
  //var token = encrypt()
  let se = decrypt(keyStr,ivStr,token)
  console.log(se);
  let ss = encrypt(keyStr,ivStr,se)
  console.log(ss);
  //console.log(se==token1);
  res.send(se)
  //res.render('index', { title: 'Express' });
});
router.post('/user/quit',(req,res)=>{
  //res.end(JSON.stringify('退出成功'))
  res.end('退出成功')
})
router.post('/user/router',async(req,res)=>{
  res.end('')
})
router.post('/user/create',async function(req,res){
  //var keyStr = '9Dvss22KnWSG/z+l/yM6JkB9adtwEoF8'
 // var ivStr = 'fffddf1968735720'
  //var data = '15197068067'+'zhang'
 // let token1 = 'sf5qq6dxu1k8CqYZG+qDR6fHYwzsQ3WPpT2N/q/B8CQ='
  //console.log(req.body);
  let userphone = req.body.userphone
  let phe = await mongodb.find('user_info',{"phone":userphone})
  console.log(phe[0]);
  if(phe[0]){
    res.send('手机号已注册')
    return
  }
  let user = {}
  user.avatar = req.body.avatar
  user.username = req.body.username
  user.sex = req.body.sex
  user.phone = userphone
  user.password = req.body.password
  user.role_id = req.body.role
  user.deleted = false
  user.banned = false
  console.log((new Date()).getTime());
  user.create_time = (new Date()).getTime()
  user.update_time = (new Date()).getTime()
  console.log(user);
  //user.create_time = 
  //var password = 'zhang'
  //var token = encrypt(data,keyStr,ivStr)
  //let token = decrypt(token1,keyStr,ivStr)
  //console.log(token);
  let data1 = await mongodb.insert('user_info',[user])
  console.log(data1);
  let id = await mongodb.find('user_info',{'phone':userphone})
  //console.log(id[0]._id.toString());
  let userId = id[0]._id.toString()
  //console.log(typeof(id[0]._id.toString()));
  let data = await mongodb.update('user_info',{'phone':userphone},{'user_id':userId})
  console.log(data);
  //res.writeHead(200,{'Content-Type':'application/json'});
  res.end(JSON.stringify({"code":0,"data":null,"message":'成功'}))
  //res.end(JSON.stringify(data));
})
router.post('/user/*/update',async(req,res)=>{
  console.log(req.path);
  console.log(req.body);
  let userId = req.path.substr(6,24)
  console.log(userId);
  let user = {}
  user.avatar = req.body.avatar
  user.username = req.body.username
  user.sex = req.body.sex
  user.phone = req.body.userphone
  user.password = req.body.password
  user.role_id = req.body.role
  console.log((new Date()).getTime());
  user.update_time = (new Date()).getTime()
  console.log(user);
  let data = await mongodb.update('user_info',{'user_id':userId},user)
  console.log(data);
  res.end(JSON.stringify({"code":0,"data":null,"message":'成功'}))
})
router.delete('/user/*',async(req,res)=>{
  //console.log(req.pathname)
  var user_id = req.path.substr(6)
  console.log(user_id);
  let data = await mongodb.update('user_info',{'user_id':user_id},{'deleted':true,'update_time':(new Date()).getTime()})
  console.log(data);
  res.end(JSON.stringify({"code":0,"data":null,"message":'成功'})) 
})
router.get('/user/list',async(req,res)=>{
  console.log(req.query);
  let pageSize = Number(req.query.pageSize)
  let pageIndex = (Number(req.query.pageIndex)-1)*pageSize
  let data = await mongodb.findPage('user_info',{'deleted':false},pageIndex,pageSize)
  for(var i=0;i<data.length;i++){
    delete data[i].password
    //data[i].userId = data[i]._id
  }
  console.log(data);
  res.end(JSON.stringify({"code":0,"data":data,"message":'成功'}))
})


