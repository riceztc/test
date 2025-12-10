// 小程序云开发诊断工具
// 在微信开发者工具控制台中运行

function diagnoseCloudDevelopment() {
  console.log('🔍 开始诊断云开发环境...\n')
  
  // 检查1: 云开发初始化
  console.log('📋 检查1: 云开发初始化状态')
  try {
    if (wx.cloud) {
      console.log('✅ wx.cloud 对象存在')
      
      wx.cloud.init({
        env: 'cloud1-6gjyjg4p7776e793',
        traceUser: true
      })
      
      console.log('✅ 云开发初始化完成')
      console.log('📍 当前环境:', wx.cloud.DYNAMIC_CURRENT_ENV)
    } else {
      console.log('❌ wx.cloud 对象不存在')
      console.log('💡 请使用 2.2.3 或以上版本的基础库')
      return
    }
  } catch (err) {
    console.log('❌ 云开发初始化失败:', err)
    return
  }
  
  // 检查2: 测试云函数调用
  console.log('\n📋 检查2: 测试云函数调用')
  wx.cloud.callFunction({
    name: 'addBill',
    data: {
      test: true,
      title: '诊断测试',
      amount: '1.00',
      type: '支出'
    },
    success: (res) => {
      console.log('✅ 云函数调用成功')
      console.log('📊 返回结果:', res.result)
      
      if (res.result && res.result.success) {
        console.log('🎉 云函数功能正常!')
        
        // 检查3: 验证数据库写入
        console.log('\n📋 检查3: 验证数据库写入')
        wx.cloud.callFunction({
          name: 'getBills',
          data: {},
          success: (listRes) => {
            console.log('✅ 数据库读取成功')
            console.log('📊 账单数量:', listRes.result.data ? listRes.result.data.length : 0)
            
            if (listRes.result && listRes.result.data && listRes.result.data.length > 0) {
              console.log('🎉 数据库功能完全正常!')
              console.log('📝 最新账单:', listRes.result.data[0])
            } else {
              console.log('⚠️ 数据库为空，但连接正常')
            }
          },
          fail: (err) => {
            console.log('❌ 数据库读取失败:', err)
            console.log('💡 可能原因: 数据库权限设置错误或集合未创建')
          }
        })
      } else {
        console.log('❌ 云函数逻辑有问题:', res.result.message)
      }
    },
    fail: (err) => {
      console.log('❌ 云函数调用失败')
      console.log('🔍 错误详情:', err)
      
      // 错误分析
      if (err.errMsg.includes('Function not found') || err.errMsg.includes('function not found')) {
        console.log('💡 解决方案: 云函数未正确上传')
        console.log('   步骤1: 右键 cloudfunctions/addBill')
        console.log('   步骤2: 选择"上传并部署：云端安装依赖"')
      } else if (err.errMsg.includes('permission denied')) {
        console.log('💡 解决方案: 权限问题')
        console.log('   步骤1: 检查环境ID是否正确')
        console.log('   步骤2: 确认云开发环境已开通')
      } else if (err.errMsg.includes('timeout')) {
        console.log('💡 解决方案: 超时问题')
        console.log('   步骤1: 检查网络连接')
        console.log('   步骤2: 重新尝试上传云函数')
      }
    }
  })
  
  console.log('\n⏳ 诊断中，请等待结果...')
}

// 执行诊断
diagnoseCloudDevelopment()

console.log('\n📌 使用说明:')
console.log('1. 复制以上代码到微信开发者工具控制台')
console.log('2. 按回车执行')
console.log('3. 查看诊断结果和修复建议')
console.log('4. 根据建议修复问题后重新运行诊断')