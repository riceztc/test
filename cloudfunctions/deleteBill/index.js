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
    
    // 删除账单
    const result = await db.collection('bills')
      .doc(id)
      .remove()
    
    return {
      success: true,
      data: { deletedId: id },
      message: '删除账单成功'
    }
  } catch (error) {
    console.error('删除账单失败:', error)
    return {
      success: false,
      error: error.message,
      message: '删除账单失败'
    }
  }
}