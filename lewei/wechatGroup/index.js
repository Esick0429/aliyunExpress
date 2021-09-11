// 引入相关模块
var { connect } = require('./database/mongo')
const Config = require("./config/index");
const rp = require('request-promise')

var getRawBody = require('raw-body');
var getFormBody = require('body/form');
var body = require('body');

exports.handler = (req, resp, nexp, context) => {
    getRawBody(req, async function (err, body) {
        // 获取参数
        const pageIndex = req.queries.pageIndex - 0
        const pageSize = req.queries.pageSize - 0
        resp.setStatusCode(200)
        resp.setHeader('Content-Type', 'application/json')
        if (req.path === '/groupList' && req.method === 'GET' && pageIndex && pageSize) {
            // 连接数据库
            var db = await connect(Config.dbUrl)
            var we_chat = db.db("we_chat")

            //获取筛选条件 群聊名称 教师名称
            const anchor_name = req.queries.anchorName
            const room_name = req.queries.roomName

            var wherestr = {}
            if (!anchor_name && !room_name) {
                wherestr = {}
            }
            else {
                //筛选教师名称
                var live = db.db("live")
                var filterAnchor = await live.collection("anchor_info").find({ 'anchor_name': { $regex: anchor_name } }).toArray()
                // console.log(filterAnchor)
                var arr = []
                for (var i = 0; i < filterAnchor.length; i++) {
                    arr.push({ 'anchor_id': { $regex: filterAnchor[i].anchor_id } })
                }
                if (arr.length === 0) {
                    resp.send(JSON.stringify({ code: 0, message: '获取信息成功', data: { total: 0, items: [] } }))
                }
                wherestr = {
                    //多字段匹配
                    '$and': [
                        { 'room_name': { $regex: room_name } },
                        anchor_name ? { '$or': arr } : {}
                    ]
                }
                console.log(JSON.stringify(wherestr))
            }

            // 计算总条数
            let total = await we_chat.collection("wechat_group").find(wherestr).count()
            // 查找群列表
            we_chat.collection("wechat_group").find(wherestr).skip((pageIndex - 1) * pageSize).limit(pageSize).sort({ creat_time: -1 }).toArray(async (err, docs) => {
                console.log(docs)
                if (err) throw err
                const items = []
                var db = await connect(Config.dbUrl)
                var live = db.db("live")
                for (var i = 0; i < docs.length; i++) {
                    // 查找群绑定的教师信息
                    var anchorInfo = []
                    if (docs[i].anchor_id) {
                        anchorInfo = await live.collection("anchor_info").find({ 'anchor_id': docs[i].anchor_id }).toArray()
                        // console.log(anchorInfo)
                    }
                    const obj = {
                        id: docs[i]._id,
                        roomId: docs[i].room_id,
                        roomName: docs[i].room_name,
                        anchorId: docs[i].anchor_id,
                        creatTime: docs[i].creat_time,
                        anchorName: anchorInfo.length > 0 ? anchorInfo[0].anchor_name : ''
                    }
                    items.push(obj)
                }
                resp.send(JSON.stringify({ code: 0, message: '获取信息成功', data: { total, items } }))
            })
        }
        else if (req.path === '/associated' && req.method === 'POST') {
            // 接受参数
            const room_id = JSON.parse(body.toString()).roomId
            const anchor_id = JSON.parse(body.toString()).anchorId
            // 判断参数
            if (!room_id || !anchor_id) {
                resp.send(JSON.stringify({ code: 4444, message: '参数不齐' }))
                return
            }
            // 连数据库
            const db = await connect(Config.dbUrl)
            var we_chat = db.db("we_chat")
            // 判断群组绑定
            const groupJudge = await we_chat.collection("wechat_group").find({ 'room_id': room_id }).toArray()
            // 判断教师绑定
            const anchorJudge = await we_chat.collection("wechat_group").find({ 'anchor_id': anchor_id }).toArray()
            console.log('111');
            console.log(anchorJudge)
            if (groupJudge[0].anchor_id) {
                resp.send(JSON.stringify({ code: 4444, message: '该群组已绑定' }))
                return
            }
            if (anchorJudge.length > 0) {
                resp.send(JSON.stringify({ code: 4444, message: '该教师已绑定' }))
                return
            }
            // 若未绑定 则为教师绑定
            const res = await we_chat.collection("wechat_group").updateOne({ 'room_id': room_id }, {
                $set: {
                    'anchor_id': anchor_id
                }
            })
            var options = {
                url: 'https://work.weixin.qq.com/wework_admin/customer/qun/getRoomMemberList?roomid=' + room_id,//请求路径
                method: "GET",//请求方式，默认为get
                headers: {//设置请求头
                    "content-type": "application/json",
                    'Cookie': 'tvfe_boss_uuid=3e8c82bc75e18d8f; pgv_pvid=9937770156; pgv_info=ssid=s6718801232; wwrtx.ref=direct; wwrtx.i18n_lan=zh; RK=pujF2nz+Zv; ptcz=b21574b76d213bfbbf5f689e9c7ca3969d34437bf58450571c9731aa4b0b4347; ptui_loginuin=1453628322; uin=o1453628322; skey=@D6daQCxxq; verifysession=h01fdeb290ebb6b9ba908c68716fa6b95c25100b3026d56b568c476555e94cfd9001341b8ed5d68aa49; wwrtx.refid=28723469993543399; wwrtx.c_gdpr=0; Hm_lvt_9364e629af24cb52acc78b43e8c9f77d=1630893603; _ga=GA1.2.851488614.1630893604; _gid=GA1.2.1800651407.1630893604; Hm_lpvt_9364e629af24cb52acc78b43e8c9f77d=1630893712; wwopen.open.sid=wAypJfeoOwAZTqtqIoxPTNEqd9Gmo3Y3sjvVjMISUaT6SyDogndGRNjPF3kWz0TBO; wwrtx.ltype=1; wwrtx.vid=1688856743238689; wxpay.corpid=1970324944168746; wxpay.vid=1688856743238689; wwrtx.cs_ind=; wwrtx.logined=true; wwrtx.d2st=a6776353; wwrtx.sid=7IbOJdKDCP9v4FDzrAo2_YVAfoN49g5FKA95uhUj22gJgzhK_PPUSODf-QGurPzJ; wwrtx.vst=aOaxR9YwLR4ikOaK41-h7sF7nMj7PdAZkX3RqKgP2V_eKBunSMXWyc-hpxwSChz9B7BXpm0HGbPsfhPrjziS811GEPe4u5ZB3pLyILBBuKcQ9EIu4UFPzsTv-IxMUL608FNMpJhCymdV1OTX_K41ccYK_28prlUrp-V1WPgo4pPQnO8fg54c27aZdI9reKuecHdFFWC8N-tJ0u7Fu5eAInz4RotDeaejGiubcAG23A7haTlFxcjUS8S0dlAaN4snmq1mDHB9RFwf7ZJJe6UtOw; _gat=1'
                }
            }
            rp(options)
                .then( async function (repos) {
                    console.log(JSON.parse(repos).data.qrcode_url)
                    var live = db.db("live")
                    const live_res = await live.collection("group").updateOne({ 'anchor_id': anchor_id }, {
                        $set: {
                            'anchor_id': anchor_id,
                            'creat_time': Date.now(),
                            'deleted': false,
                            'group_brief': '介绍',
                            'group_number': room_id,
                            'group_qrcode': JSON.parse(repos).data.qrcode_url,
                            'group_qrcode_media_id': '',
                            'group_type': 'FANDOM',
                            'manipulate_id': '588419093355573248',
                            'qrcode_media_expire_time': Date.now(),
                            'tags': ["aaa"],
                            'update_time': Date.now()
                        }
                    }, { upsert: true })
                    resp.send(JSON.stringify({ code: 0, message: '修改信息成功', res }))
                })
                .catch(function (err) {

                })
        }
        else if (req.path === '/cancleAssociated' && req.method === 'POST') {
            // 接受参数
            const room_id = JSON.parse(body.toString()).roomId
            // 连数据库
            const db = await connect(Config.dbUrl)
            var we_chat = db.db("we_chat")
            // 取消关联
            const res = await we_chat.collection("wechat_group").updateOne({ 'room_id': room_id }, {
                $set: {
                    'anchor_id': ''
                }
            })
            var live = db.db("live")
            const live_res = await live.collection("group").updateOne({ 'group_number': room_id },{
                $set: {
                    'group_qrcode': '',
                    'deleted': true
                }
            })
            resp.send(JSON.stringify({ code: 0, message: '取消关联成功', res }))
        }
        else if (req.path === '/anchorList' && req.method === 'GET') {
            const db = await connect(Config.dbUrl)
            var live = db.db("live")
            let anchorList = await live.collection("anchor_info").find({ deleted: false, status: { $ne: 'ELIMINATION' } }).toArray()
            let total = await live.collection("anchor_info").find({ deleted: false, status: { $ne: 'ELIMINATION' } }).count()
            let items = []
            anchorList.forEach(el => {
                let obj = {
                    anchorId: el.anchor_id,
                    anchorName: el.anchor_name
                }
                items.push(obj)
            })
            resp.send(JSON.stringify({ code: 0, data: { total, items } }))
        }
        else {
            resp.send(JSON.stringify({ code: 4444, data: null, message: '失败' }))
        }
    })
}