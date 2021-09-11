// 引入相关模块
var url = require('url')
var db = require('./database/mongo')
const trigger = require('./trigger')

var getRawBody = require('raw-body');
var getFormBody = require('body/form');
var body = require('body');

exports.handler = (event, context, callback) => {
    trigger.nodePostGetRequest('work.weixin.qq.com', 443, "GET", "",async (res) => {
        let conn = await db.connect()
        const data = JSON.parse(res).data.datalist
        for (let i = 0; i < data.length; i++) {
            await conn.collection("wechat_group").updateOne({'room_id': data[i].roomid},{$set:{'room_id': data[i].roomid, 'room_name': data[i].roomname, creat_time: data[i].createtime * 1000}},{upsert:true})
        }
        console.log(res);
        callback(null, res);
        }, '/wework_admin/customer/getGroupChatList', 'tvfe_boss_uuid=3e8c82bc75e18d8f; pgv_pvid=9937770156; pgv_info=ssid=s6718801232; wwrtx.ref=direct; wwrtx.i18n_lan=zh; RK=pujF2nz+Zv; ptcz=b21574b76d213bfbbf5f689e9c7ca3969d34437bf58450571c9731aa4b0b4347; ptui_loginuin=1453628322; uin=o1453628322; skey=@D6daQCxxq; verifysession=h01fdeb290ebb6b9ba908c68716fa6b95c25100b3026d56b568c476555e94cfd9001341b8ed5d68aa49; wwrtx.refid=28723469993543399; wwrtx.c_gdpr=0; Hm_lvt_9364e629af24cb52acc78b43e8c9f77d=1630893603; _ga=GA1.2.851488614.1630893604; _gid=GA1.2.1800651407.1630893604; Hm_lpvt_9364e629af24cb52acc78b43e8c9f77d=1630893712; wwopen.open.sid=wAypJfeoOwAZTqtqIoxPTNEqd9Gmo3Y3sjvVjMISUaT6SyDogndGRNjPF3kWz0TBO; wwrtx.ltype=1; wwrtx.vid=1688856743238689; wxpay.corpid=1970324944168746; wxpay.vid=1688856743238689; wwrtx.cs_ind=; wwrtx.logined=true; wwrtx.d2st=a6776353; wwrtx.sid=7IbOJdKDCP9v4FDzrAo2_YVAfoN49g5FKA95uhUj22gJgzhK_PPUSODf-QGurPzJ; wwrtx.vst=8PmsfxxQYojVZbAmxKOK230oFR8RikCu2cv8ZSaUXbQChXuiGCAXs_vSu5p8eCH9J19EGDcJ0J6gwn72nIBmnCFSA3wPOfgEEd_3URyGo0B_sLXslPbCLHwQ5Zrv2xanmYlLHPzYEWwYO-15I9HxF3oZnUFuilVKBzCjdqMakHp0g4ZJeHCYt-EENlMp_8jtTt4tQcE5nvpn4z16pSp5vZyQK8wKLoXAbLgxuB-KL-8Kv77uM3_o8Bn2b0dbQBVsgsvjXPjwympvph5P1QNBjA; _gat=1')
}