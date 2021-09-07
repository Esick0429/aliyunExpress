const db = require('../db/mongo.js')

exports.findAnchor = async (req, res) => {
    let pageIndex = Number(req.query.pageIndex) || 1
    let pageSize = Number(req.query.pageSize) || 20
    let startTime = Number(req.query.startTime) || 0
    let endTime = Number(req.query.endTime) || 0
    let anchorName = req.query.anchorName || ""
    let anchorInfo
    let finalDuration
    let finalDurationTwo
    let live_info
    let source
    let live_count
    console.log(pageIndex,pageSize,startTime, endTime, anchorName);
    if (anchorName !== "") {
        anchorInfo = await db.findData('live', 'anchor_info', {
            anchor_name: anchorName
        })
    } else {
        anchorInfo = await db.findData('live', 'anchor_info', {})
    }
    let anchor_id_list = []
    let source_id_list = []
    for (let k = 0; k < anchorInfo.length; k++) {
        anchor_id_list.push(anchorInfo[k].anchor_id)
        source_id_list.push(anchorInfo[k].source_id)
    }
    source = await db.findData('common', 'source', {
        source_id: { $in: source_id_list }
    })
    let startTime2 = ctime(startTime)
    let endTime2 = ctime(endTime)
    if (startTime !== 0 && endTime !== 0) {
        finalDuration = await db.findSort('live', 'daily_live_statistic', {
            anchor_id: {
                $in: anchor_id_list
            },
            time: startTime2
        }, {
            _id: -1
        })
        finalDurationTwo = await db.findSort('live', 'daily_live_statistic', {
            anchor_id: {
                $in: anchor_id_list
            },
            time: endTime2
        }, {
            _id: -1
        })
        live_info = await db.findData('live', 'live_statistic', {
            anchor_id: {
                $in: anchor_id_list
            }
        })
        console.log(finalDuration.length,'++++++');
        console.log(finalDurationTwo.length,'mmmm');
    } else {
        live_info = await db.findData('live', 'live_statistic', {
            anchor_id: {
                $in: anchor_id_list
            }
        })
    }
    let live_info_anchor_id_list = []
    for (let i of live_info) {
        live_info_anchor_id_list.push(i.anchor_id)
    }
    let live_cout_list = []
    for (let i of live_info_anchor_id_list) {
        if (startTime !== 0 && endTime !== 0) {
            live_count = await db.count('live', 'live_history', {
                anchor_id: i,
                start_time: {
                    $gte: startTime
                },
                end_time: {
                    $lte: endTime
                }
            })
        } else {
            live_count = await db.count('live', 'live_history', {
                anchor_id: i
            })
        }
        live_cout_list.push({ anchorId: i, count: live_count })
    }
    let fans_count_list = []
    let sourceInfo = source.map(item => {
        return{
            sourceId: item.source_id,
            sourceName: item.source_name
        }
    })
    let liveInfo = live_info.map(item => {
        return{
            anchorId: item.anchor_id,
            fansCount: item.fans_count,
            duration:item.duration,
            likesSum:item.likes_sum
        }
    })
    let liveCoutList = live_cout_list.map(item => {
        return{
            anchorId: item.anchorId,
            liveCount: item.count
        }
    })
    console.log(sourceInfo);
    console.log(liveInfo);
    console.log(liveCoutList);

    if (startTime !== 0 && endTime !== 0) {
        for (let i of anchorInfo) {
            fans_count_list.push({
                anchorName: i.anchor_name,
            })
            const flagAnchorId = i.anchor_id
            const flagSourceId = i.source_id
           for(let i of sourceInfo.values()){
                if(flagSourceId === i.sourceId){
                    fans_count_list[fans_count_list.length - 1].sourceName = i.sourceName
                }
            }
            for(let i of liveInfo.values()){
                if(flagAnchorId === i.anchorId){
                    fans_count_list[fans_count_list.length - 1].nowFansCount = i.fansCount
                    fans_count_list[fans_count_list.length - 1].growFansCount = i.fansCount
                    fans_count_list[fans_count_list.length - 1].duration = i.duration
                    fans_count_list[fans_count_list.length - 1].growLikeSum = i.likesSum
                }
            }
            for(let i of liveCoutList.values()){
                if(flagAnchorId === i.anchorId){
                    fans_count_list[fans_count_list.length - 1].liveCount = i.liveCount
                }
            }
            for (let j=0;j<finalDurationTwo.length;j++) {
                if(finalDurationTwo[j]&&finalDuration[j]){
                    if (flagAnchorId === finalDurationTwo[j].anchor_id) {
                        fans_count_list[fans_count_list.length - 1].growFansCount = finalDurationTwo[j].fans_count - finalDuration[j].fans_count 
                        fans_count_list[fans_count_list.length - 1].duration = finalDurationTwo[j].duration - finalDuration[j].duration
                        fans_count_list[fans_count_list.length - 1].growLikeSum = finalDurationTwo[j].likes_sum - finalDuration[j].likes_sum
                    }
                }
            }
        }
    } else {
        for (let i of anchorInfo) {
            fans_count_list.push({
                anchorName: i.anchor_name,
            })
            const flagAnchorId = i.anchor_id
            const flagSourceId = i.source_id
            for(let i of sourceInfo.values()){
                if(flagSourceId === i.sourceId){
                    fans_count_list[fans_count_list.length - 1].sourceName = i.sourceName
                }
            }
            for(let i of liveInfo.values()){
                if(flagAnchorId === i.anchorId){
                    fans_count_list[fans_count_list.length - 1].nowFansCount = i.fansCount
                    fans_count_list[fans_count_list.length - 1].growFansCount = i.fansCount
                    fans_count_list[fans_count_list.length - 1].duration = i.duration
                    fans_count_list[fans_count_list.length - 1].growLikeSum = i.likesSum
                }
            }
            for(let i of liveCoutList.values()){
                if(flagAnchorId === i.anchorId){
                    fans_count_list[fans_count_list.length - 1].liveCount = i.liveCount
                }
            }
        }
    }
    let dataPage = pagination(pageIndex,pageSize,fans_count_list)
    console.log(dataPage);
    res.json({ code: 0, data: { total: fans_count_list.length, list: dataPage }, message: '成功' })
}


function ctime(time) {
    time = new Date(time)
    const y = time.getFullYear()
    const m = time.getMonth() + 1
    const d = time.getDate()
    time =
        y +
        '-' +
        (m < 10 ? '0' + m : m) +
        '-' +
        (d < 10 ? '0' + d : d)
    return time
}

function pagination(pageNo, pageSize, array) {
    var offset = (pageNo - 1) * pageSize;
    return (offset + pageSize >= array.length) ? array.slice(offset, array.length) : array.slice(offset, offset + pageSize);
}