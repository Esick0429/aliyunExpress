const db = require('../db/mongo.js')
exports.findAnchor = async (req, res) => {
    let pageIndex = Number(req.query.pageIndex) || 1
    let pageSize = Number(req.query.pageSize) || 20
    let startTime = Number(req.query.startTime) || 0
    let endTime = Number(req.query.endTime) || 0
    let anchorName = req.query.anchorName || ''
    let sourceName = req.query.sourceName || ''
    let anchorInfo
    let findAnchorNameList
    let findSourceIdList
    let finalDuration
    let finalDurationTwo
    let live_info
    let source
    let live_count
    console.log(pageIndex, pageSize, startTime, endTime, anchorName,sourceName);
    let findAnchorList = await db.findData('live', 'anchor_info', {})
    if (anchorName !== "") {
        findAnchorNameList = await db.findData('live', 'anchor_info', {
            anchor_name: { $regex: anchorName }
        })
    }
    if(sourceName !== ''){
        sourceList  = await db.findData('common','source',{source_name:sourceName})
        console.log(sourceList);
        findSourceIdList = await db.findData('live','anchor_info',{source_id:sourceList[0].source_id})
        // console.log(findSourceIdList);
    }
    if(findAnchorNameList && findSourceIdList){
        for(anchorInfo of findAnchorNameList){
            let number = findSourceIdList.findIndex((item) => {
                return item.anchor_id === anchorInfo.anchor_id
            })
            console.log(number);
            if(number === -1){
                res.json({code:0,data:{total:0,list:[]},message:'成功'})
                return
            }else{
                anchorInfo = pagination(pageIndex,pageSize,findAnchorNameList)
            }
        }
    }else if(findAnchorNameList){
        anchorInfo = pagination(pageIndex,pageSize,findAnchorNameList)
    }else if(findSourceIdList){
        anchorInfo = pagination(pageIndex,pageSize,findSourceIdList)
    }else{
        anchorInfo = pagination(pageIndex,pageSize,findAnchorList)
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
        console.log(startTime);
        console.log(endTime);
        console.log(startTime2);
        console.log(endTime2);

        finalDuration = await db.findSort('live', 'daily_live_statistic', {
            anchor_id: {
                $in: anchor_id_list
            },
            time: startTime2
        }, {
            _id: 1
        })
        finalDurationTwo = await db.findSort('live', 'daily_live_statistic', {
            anchor_id: {
                $in: anchor_id_list
            },
            time: endTime2
        }, {
            _id: 1
        })
        live_info = await db.findData('live', 'live_statistic', {
            anchor_id: {
                $in: anchor_id_list
            }
        })
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
    console.time('---:')
    // for (let i of live_info_anchor_id_list) {
        if (startTime !== 0 && endTime !== 0) {
            live_count = await db.findData('live', 'live_history', {
                anchor_id:{
                    $in:live_info_anchor_id_list
                },
                start_time: {
                    $gte: startTime
                },
                end_time: {
                    $lte: endTime
                }
            })
        } else {
            live_count = await db.findData('live', 'live_history', {
                anchor_id:{
                    $in:live_info_anchor_id_list
                }
            })
        }
        // live_cout_list.push({ anchorId: i, count: live_count })
    // }
    console.timeEnd('---:')
    let fans_count_list = []
    let sourceInfo = source.map(item => {
        return {
            sourceId: item.source_id,
            sourceName: item.source_name
        }
    })
    let liveInfo = live_info.map(item => {
        return {
            anchorId: item.anchor_id,
            fansCount: item.fans_count === undefined ? 0 : item.fans_count,
            duration: item.duration || 0,
            likesSum: item.likes_sum || 0
        }
    })
    if (startTime !== 0 && endTime !== 0) {
        for (let i of anchorInfo) {
            fans_count_list.push({
                anchorName: i.anchor_name,
            })
            const flagAnchorId = i.anchor_id
            const flagSourceId = i.source_id
            let flag = true
            for (let i of sourceInfo.values()) {
                if (flagSourceId === i.sourceId) {
                    fans_count_list[fans_count_list.length - 1].sourceName = i.sourceName
                }
            }
            for (let i of liveInfo.values()) {
                if (flagAnchorId === i.anchorId) {
                    flag = false
                    fans_count_list[fans_count_list.length - 1].nowFansCount = i.fansCount
                }
                if (flag === true){
                    fans_count_list[fans_count_list.length - 1].nowFansCount = 0
                }
            }
            fans_count_list[fans_count_list.length - 1].liveCount=0
            for (let i of live_count) {
                if (flagAnchorId === i.anchor_id) {
                    fans_count_list[fans_count_list.length - 1].liveCount++
                }
            }
            for (let j = 0; j < finalDurationTwo.length; j++) {
                if (finalDurationTwo[j] && finalDuration[j]) {
                    if (flagAnchorId === finalDuration[j].anchor_id) {
                        flag = false
                        fans_count_list[fans_count_list.length - 1].growFansCount = 0 || (finalDurationTwo[j].fans_count - finalDuration[j].fans_count) 
                        fans_count_list[fans_count_list.length - 1].duration = 0 || (finalDurationTwo[j].duration - finalDuration[j].duration)
                        fans_count_list[fans_count_list.length - 1].growLikeSum = 0 || (finalDurationTwo[j].likes_sum - finalDuration[j].likes_sum)
                    }
                    if(flag === true){
                        fans_count_list[fans_count_list.length - 1].growFansCount = 0
                        fans_count_list[fans_count_list.length - 1].duration = 0
                        fans_count_list[fans_count_list.length - 1].growLikeSum = 0 
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
            let flag = true
            for (let i of sourceInfo.values()) {
                if (flagSourceId === i.sourceId) {
                    fans_count_list[fans_count_list.length - 1].sourceName = i.sourceName
                }
            }
            for (let i of liveInfo.values()) {
                if (flagAnchorId === i.anchorId) {
                    flag =false
                    fans_count_list[fans_count_list.length - 1].nowFansCount = i.fansCount
                    fans_count_list[fans_count_list.length - 1].growFansCount = i.fansCount
                    fans_count_list[fans_count_list.length - 1].duration = i.duration
                    fans_count_list[fans_count_list.length - 1].growLikeSum = i.likesSum
                }
                if(flag === true){
                    fans_count_list[fans_count_list.length - 1].nowFansCount = 0
                    fans_count_list[fans_count_list.length - 1].growFansCount = 0
                    fans_count_list[fans_count_list.length - 1].duration = 0
                    fans_count_list[fans_count_list.length - 1].growLikeSum = 0
                }
            }
            fans_count_list[fans_count_list.length - 1].liveCount=0
            for (let i of live_count) {
                if (flagAnchorId === i.anchor_id) {
                    fans_count_list[fans_count_list.length - 1].liveCount++
                }
            }
        }
    }
    if (findAnchorNameList){
        res.json({ code: 0, data: { total: findAnchorNameList.length, list: fans_count_list }, message: '成功' })
    }else if(findSourceIdList){
        res.json({ code: 0, data: { total: findSourceIdList.length, list: fans_count_list }, message: '成功' })
    }else{
        res.json({ code: 0, data: { total: findAnchorList.length, list: fans_count_list }, message: '成功' })
    }
}


function ctime(time) {
    time = time + 8 * 60 * 60 * 1000
    time = new Date(time)
    const y = time.getFullYear()
    const m = time.getMonth() + 1
    const d = time.getDate()
    console.log(y, m, d);

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
