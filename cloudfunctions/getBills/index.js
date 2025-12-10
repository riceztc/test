// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  console.log('event:', event)
  
  try {
    const { type } = event
    let query = {}
    
    // 根据类型筛选
    if (type && type !== '') {
      query.type = type
    }
    
    // 获取账单列表，按时间倒序
    const result = await db.collection('bills')
      .where(query)
      .orderBy('createTime', 'desc')
      .get()
    
    return {
      success: true,
      data: result.data,
      message: '获取账单列表成功'
    }
  } catch (error) {
    console.error('获取账单列表失败:', error)
    return {
      success: false,
      error: error.message,
      message: '获取账单列表失败'
    }
  }
}