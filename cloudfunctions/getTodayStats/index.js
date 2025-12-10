// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  console.log('获取今日统计数据...')
  
  try {
    // 获取今天开始时间
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // 获取今天结束时间
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    // 查询今天的支出记录
    const expenseResult = await db.collection('bills')
      .where({
        type: '支出',
        createTime: db.command.gte(today).and(db.command.lt(tomorrow))
      })
      .get()
    
    // 查询今天的收入记录
    const incomeResult = await db.collection('bills')
      .where({
        type: '收入',
        createTime: db.command.gte(today).and(db.command.lt(tomorrow))
      })
      .get()
    
    // 计算今日支出总额
    let totalExpense = 0
    expenseResult.data.forEach(bill => {
      totalExpense += bill.amount
    })
    
    // 计算今日收入总额
    let totalIncome = 0
    incomeResult.data.forEach(bill => {
      totalIncome += bill.amount
    })
    
    // 计算净收入（收入-支出）
    const netIncome = totalIncome - totalExpense
    
    return {
      success: true,
      totalExpense: totalExpense.toFixed(2),
      totalIncome: totalIncome.toFixed(2),
      netIncome: netIncome.toFixed(2),
      expenseCount: expenseResult.data.length,
      incomeCount: incomeResult.data.length,
      totalCount: expenseResult.data.length + incomeResult.data.length,
      updateTime: new Date().toLocaleString(),
      message: '获取今日统计成功'
    }
  } catch (error) {
    console.error('获取今日统计失败:', error)
    return {
      success: false,
      error: error.message,
      message: '获取今日统计失败'
    }
  }
}