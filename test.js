// 测试云函数的脚本
// 在微信开发者工具的控制台中直接运行这些代码

console.log('=== 开始测试云函数 ===')

// 测试1: 检查云开发是否初始化
try {
  console.log('云开发状态:', wx.cloud)
  console.log('当前环境:', wx.cloud.DYNAMIC_CURRENT_ENV)
} catch (err) {
  console.error('云开发未初始化:', err)
}

// 测试2: 直接调用云函数
console.log('\n=== 测试添加账单云函数 ===')
wx.cloud.callFunction({
  name: 'addBill',
  data: {
    title: '测试账单',
    amount: '10.00',
    type: '支出',
    remark: '这是一个测试账单'
  },
  success: (res) => {
    console.log('✅ 云函数调用成功:')
    console.log('返回结果:', res)
    console.log('返回数据:', res.result)
    
    if (res.result && res.result.success) {
      console.log('🎉 账单添加成功! ID:', res.result.data._id)
    } else {
      console.log('❌ 账单添加失败:', res.result.message)
    }
  },
  fail: (err) => {
    console.error('❌ 云函数调用失败:')
    console.error('错误信息:', err)
    console.error('错误详情:', err.errMsg)
    console.error('错误码:', err.errCode)
    
    // 常见错误分析
    if (err.errMsg.includes('Function not found')) {
      console.log('💡 建议: 云函数可能未正确上传，请检查云函数部署')
    } else if (err.errMsg.includes('permission')) {
      console.log('💡 建议: 权限问题，请检查云开发环境配置')
    } else if (err.errMsg.includes('network')) {
      console.log('💡 建议: 网络问题，请检查网络连接')
    }
  }
})

// 测试3: 检查数据库集合是否存在
console.log('\n=== 测试数据库连接 ===')
wx.cloud.callFunction({
  name: 'getBills',
  data: {},
  success: (res) => {
    console.log('✅ getBills 云函数正常')
    console.log('账单列表:', res.result)
  },
  fail: (err) => {
    console.error('❌ getBills 云函数失败:', err)
  }
})

console.log('\n=== 测试脚本执行完成 ===')
console.log('请查看上述输出结果，如果有错误请根据提示进行修复')