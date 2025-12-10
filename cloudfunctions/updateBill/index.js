// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  console.log('=== updateBill 云函数开始执行 ===')
  console.log('接收到的事件数据:', JSON.stringify(event, null, 2))
  
  try {
    const { id, title, amount, type, remark } = event
    console.log('解构后的参数:', { id, title, amount, type, remark })
    
    // 参数验证
    if (!id || !title || !amount || !type) {
      console.log('参数验证失败:', { id, title, amount, type })
      return {
        success: false,
        message: '参数不完整',
        received: { id, title, amount, type }
      }
    }
    
    // 更新数据
    const updateData = {
      title: title.trim(),
      amount: parseFloat(amount),
      type: type,
      remark: remark ? remark.trim() : '',
      updateTime: new Date()
    }
    
    console.log('准备更新的数据:', JSON.stringify(updateData, null, 2))
    
    // 执行更新
    console.log('正在更新账单，ID:', id)
    const result = await db.collection('bills')
      .doc(id)
      .update({
        data: updateData
      })
    
    console.log('数据库更新结果:', result)
    
    const response = {
      success: true,
      data: updateData,
      updatedId: id,
      message: '更新账单成功'
    }
    
    console.log('=== updateBill 云函数执行成功 ===')
    console.log('返回结果:', JSON.stringify(response, null, 2))
    
    return response
  } catch (error) {
    console.error('=== updateBill 云函数执行失败 ===')
    console.error('错误对象:', error)
    console.error('错误信息:', error.message)
    
    const errorResponse = {
      success: false,
      error: error.message,
      errorDetails: {
        name: error.name,
        stack: error.stack
      },
      message: '更新账单失败'
    }
    
    console.log('错误返回结果:', JSON.stringify(errorResponse, null, 2))
    
    return errorResponse
  }
}