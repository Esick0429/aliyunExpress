// 引入相关模块
var url = require('url')
// const trigger = require('./trigger')
var https = require('https')
var { connect } = require('./database/mongo')
const Config = require("./config/index")
var rp = require('request-promise')

var getRawBody = require('raw-body');
var getFormBody = require('body/form');
var body = require('body');


exports.handler = async (event, context, callback) => {
    var db = await connect(Config.dbUrl)
    var we_chat = db.db("we_chat")
    const res = await we_chat.collection("wechat_group").find().toArray()
    let num = 0
    for(let i =0; i < res.length; i++){
        if (res[i].anchor_id) {
            // request({
            //     url: 'https://work.weixin.qq.com/wework_admin/customer/qun/getRoomMemberList?lang=zh_CN&f=json&ajax=1&timeZoneInfo%5Bzone_offset%5D=-8&random=0.7880104983530998&off_set=0&limit=600&roomid=' + el.room_id + '&page=1&_d2st=a6776353',//请求路径
            //     method: "GET",//请求方式，默认为get
            //     headers: {//设置请求头
            //         "content-type": "application/json",
            //         'Cookie': 'tvfe_boss_uuid=3e8c82bc75e18d8f; pgv_pvid=9937770156; pgv_info=ssid=s6718801232; wwrtx.ref=direct; wwrtx.i18n_lan=zh; RK=pujF2nz+Zv; ptcz=b21574b76d213bfbbf5f689e9c7ca3969d34437bf58450571c9731aa4b0b4347; ptui_loginuin=1453628322; uin=o1453628322; skey=@D6daQCxxq; verifysession=h01fdeb290ebb6b9ba908c68716fa6b95c25100b3026d56b568c476555e94cfd9001341b8ed5d68aa49; wwrtx.refid=28723469993543399; wwrtx.c_gdpr=0; Hm_lvt_9364e629af24cb52acc78b43e8c9f77d=1630893603; _ga=GA1.2.851488614.1630893604; _gid=GA1.2.1800651407.1630893604; Hm_lpvt_9364e629af24cb52acc78b43e8c9f77d=1630893712; wwopen.open.sid=wAypJfeoOwAZTqtqIoxPTNEqd9Gmo3Y3sjvVjMISUaT6SyDogndGRNjPF3kWz0TBO; wwrtx.ltype=1; wwrtx.vid=1688856743238689; wxpay.corpid=1970324944168746; wxpay.vid=1688856743238689; wwrtx.cs_ind=; wwrtx.logined=true; wwrtx.d2st=a6776353; wwrtx.sid=7IbOJdKDCP9v4FDzrAo2_YVAfoN49g5FKA95uhUj22gJgzhK_PPUSODf-QGurPzJ; wwrtx.vst=zv6bXa7LfuasZnt0A0vgD0xyYYkqY8sisdvG58IKJsf7xoihvoeFBx2kvBDE-KBizYar0tbvOVYR1GD9qg1i2vjuRwhBhA2TllX0NQjB-zW0pfOMc5Xo6asAWesRIqbLNOv_8_uVLanUOvVlsATtBP01mQu3Ihg996ONnTlbPvkg42L71S4CgzmbQvy2GA_bgQf7_fJyhv9fnnA53PHpWoZvV1L3OezDWMockPO6ym3Px-muSdN3ptSTVwVrOjBTs5ltqbJrM35Clbd5tglBbg; _gat=1'
            //     }
            // }, function (error, response, body) {
            //     if (!error && response.statusCode == 200) {
            //         var live = db.db("live")
            //         live.collection("group").updateOne({'anchor_id': el.anchor_id},{$set:{'group_qrcode': JSON.parse(body).data.qrcode_url}})
            //         console.log(el.room_id)
            //         console.log(JSON.parse(body).data.qrcode_url)
            //     } else {
            //         console.log('false')
            //     }
            // })

            var options = {
                url: 'https://work.weixin.qq.com/wework_admin/customer/qun/getRoomMemberList?roomid=' + res[i].room_id,//请求路径
                method: "GET",//请求方式，默认为get
                headers: {//设置请求头
                    "content-type": "application/json",
                    'Cookie': 'tvfe_boss_uuid=3e8c82bc75e18d8f; pgv_pvid=9937770156; pgv_info=ssid=s6718801232; wwrtx.ref=direct; wwrtx.i18n_lan=zh; RK=pujF2nz+Zv; ptcz=b21574b76d213bfbbf5f689e9c7ca3969d34437bf58450571c9731aa4b0b4347; ptui_loginuin=1453628322; uin=o1453628322; skey=@D6daQCxxq; verifysession=h01fdeb290ebb6b9ba908c68716fa6b95c25100b3026d56b568c476555e94cfd9001341b8ed5d68aa49; wwrtx.refid=28723469993543399; wwrtx.c_gdpr=0; Hm_lvt_9364e629af24cb52acc78b43e8c9f77d=1630893603; _ga=GA1.2.851488614.1630893604; _gid=GA1.2.1800651407.1630893604; Hm_lpvt_9364e629af24cb52acc78b43e8c9f77d=1630893712; wwopen.open.sid=wAypJfeoOwAZTqtqIoxPTNEqd9Gmo3Y3sjvVjMISUaT6SyDogndGRNjPF3kWz0TBO; wwrtx.ltype=1; wwrtx.vid=1688856743238689; wxpay.corpid=1970324944168746; wxpay.vid=1688856743238689; wwrtx.cs_ind=; wwrtx.logined=true; wwrtx.d2st=a6776353; wwrtx.sid=7IbOJdKDCP9v4FDzrAo2_YVAfoN49g5FKA95uhUj22gJgzhK_PPUSODf-QGurPzJ; wwrtx.vst=zv6bXa7LfuasZnt0A0vgD0xyYYkqY8sisdvG58IKJsf7xoihvoeFBx2kvBDE-KBizYar0tbvOVYR1GD9qg1i2vjuRwhBhA2TllX0NQjB-zW0pfOMc5Xo6asAWesRIqbLNOv_8_uVLanUOvVlsATtBP01mQu3Ihg996ONnTlbPvkg42L71S4CgzmbQvy2GA_bgQf7_fJyhv9fnnA53PHpWoZvV1L3OezDWMockPO6ym3Px-muSdN3ptSTVwVrOjBTs5ltqbJrM35Clbd5tglBbg; _gat=1'
                }
            }
            rp(options)
                .then(function (repos) {
                    num ++
                    var live = db.db("live")
                    live.collection("group").updateOne({'anchor_id': res[i].anchor_id},{$set:{'group_qrcode': JSON.parse(repos).data.qrcode_url}})
                    console.log(JSON.parse(repos).data.qrcode_url);
                    if (num === res.length) {
                        callback(null, '成功')
                    }
                })
                .catch(function (err) {
                    num ++
                    console.log(err);
                    if (num === res.length) {
                        callback(null, '成功')
                    }
                })

        } else {
            num ++
            if (num === res.length) {
                        callback(null, '成功')
            }
        }
    }
}