// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  console.log('event:', event)
  
  try {
    const { id } = event
    
    if (!id) {
      return {
        success: false,
        message: '账单ID不能为空'
      }
    }
    
    // 查询账单详情
    const result = await db.collection('bills')
      .doc(id)
      .get()
    
    if (!result.data) {
      return {
        success: false,
        message: '账单不存在'
      }
    }
    
    return {
      success: true,
      data: result.data,
      message: '获取账单详情成功'
    }
  } catch (error) {
    console.error('获取账单详情失败:', error)
    return {
      success: false,
      error: error.message,
      message: '获取账单详情失败'
    }
  }
}