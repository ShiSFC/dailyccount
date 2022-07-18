// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database();
const _ = db.command;
const MAX_LIMIT = 100;

// 云函数入口函数
exports.main = async (event, context) => {
    let year = event.year
    let openid = event.openid
    let maxyear = (Number(year)+1).toString()
    const data = db.collection('accountBook').where(_.and([
        {
            _openid:openid,
            formatDate:_.and(_.gte(new Date(year+'/1/1 00:00:00')),_.lt(new Date(maxyear+'/1/1 00:00:00')))
        },
        _.or([
                {'expense.totalAmount':_.neq(0)},
                {'income.totalAmount':_.neq(0)}
        ])
    ])).orderBy('formatDate','asc')
    const countResult = await data.count()
    const total = countResult.total
    // 计算需分几次取
    const batchTimes = Math.ceil(total / 100)
    // 承载所有读操作的 promise 的数组
    const tasks = []
    for (let i = 0; i < batchTimes; i++) {
        const promise = data.skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
        tasks.push(promise)
    }
    // 等待所有
    return (await Promise.all(tasks)).reduce((acc, cur) => {
        return {
            data: acc.data.concat(cur.data),
            errMsg: acc.errMsg,
        }
    })
}