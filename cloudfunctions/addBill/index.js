// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  console.log('=== 云函数开始执行 ===')
  console.log('接收到的事件数据:', JSON.stringify(event, null, 2))
  console.log('上下文信息:', context)
  
  try {
    // 首先创建集合（如果不存在）
    console.log('检查/创建 bills 集合...')
    try {
      await db.createCollection('bills')
      console.log('bills 集合创建成功')
    } catch (createErr) {
      console.log('bills 集合可能已存在:', createErr.message)
    }
    
    // 检查数据库连接
    console.log('正在连接数据库...')
    const testResult = await db.collection('bills').get().catch(() => null)
    console.log('数据库连接测试:', testResult ? '正常，找到记录' : '集合为空或无权限')
    
    const { title, amount, type, remark } = event
    console.log('解构后的参数:', { title, amount, type, remark })
    
    // 参数验证
    if (!title || !amount || !type) {
      console.log('参数验证失败:', { title, amount, type })
      return {
        success: false,
        message: '参数不完整',
        received: { title, amount, type }
      }
    }
    
    // 获取用户信息
    const wxContext = cloud.getWXContext()
    console.log('微信上下文:', wxContext)
    
    // 创建账单数据
    const billData = {
      title: title.trim(),
      amount: parseFloat(amount),
      type: type,
      remark: remark ? remark.trim() : '',
      createTime: new Date(),
      updateTime: new Date(),
      _openid: wxContext.OPENID // 添加用户标识
    }
    
    console.log('准备插入的数据:', JSON.stringify(billData, null, 2))
    
    // 插入数据库
    console.log('正在插入数据到 bills 集合...')
    const result = await db.collection('bills').add({
      data: billData
    })
    
    console.log('数据库插入结果:', result)
    
    const response = {
      success: true,
      data: {
        _id: result._id,
        ...billData
      },
      message: '添加账单成功'
    }
    
    console.log('=== 云函数执行成功 ===')
    console.log('返回结果:', JSON.stringify(response, null, 2))
    
    return response
  } catch (error) {
    console.error('=== 云函数执行失败 ===')
    console.error('错误对象:', error)
    console.error('错误信息:', error.message)
    console.error('错误堆栈:', error.stack)
    
    const errorResponse = {
      success: false,
      error: error.message,
      errorDetails: {
        name: error.name,
        stack: error.stack
      },
      message: '添加账单失败'
    }
    
    console.log('错误返回结果:', JSON.stringify(errorResponse, null, 2))
    
    return errorResponse
  }
}