// 数据库初始化云函数
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  console.log('=== 数据库初始化开始 ===')
  
  const collections = ['bills']
  const results = []
  
  for (const collectionName of collections) {
    try {
      console.log(`正在创建集合: ${collectionName}`)
      
      // 尝试创建集合
      await db.createCollection(collectionName)
      console.log(`✅ 集合 ${collectionName} 创建成功`)
      
      // 插入一条测试数据
      const testDoc = {
        title: '测试数据',
        amount: 0.01,
        type: '支出',
        remark: '数据库初始化测试数据',
        createTime: new Date(),
        updateTime: new Date(),
        _openid: cloud.getWXContext().OPENID || 'test_openid'
      }
      
      const insertResult = await db.collection(collectionName).add({
        data: testDoc
      })
      
      console.log(`✅ 测试数据插入成功，ID: ${insertResult._id}`)
      
      results.push({
        collection: collectionName,
        status: 'success',
        testId: insertResult._id
      })
      
    } catch (error) {
      console.log(`⚠️ 集合 ${collectionName} 处理异常:`, error.message)
      
      // 如果是集合已存在的错误，尝试添加测试数据
      if (error.message.includes('already exists') || error.message.includes('already created')) {
        console.log(`集合 ${collectionName} 已存在，尝试添加测试数据...`)
        
        try {
          const testDoc = {
            title: '测试数据-已存在',
            amount: 0.02,
            type: '支出', 
            remark: '测试已存在集合的写入权限',
            createTime: new Date(),
            updateTime: new Date(),
            _openid: cloud.getWXContext().OPENID || 'test_openid'
          }
          
          const insertResult = await db.collection(collectionName).add({
            data: testDoc
          })
          
          console.log(`✅ 已存在集合测试数据插入成功，ID: ${insertResult._id}`)
          
          results.push({
            collection: collectionName,
            status: 'already_exists',
            testId: insertResult._id
          })
        } catch (insertError) {
          console.error(`❌ 已存在集合测试数据插入失败:`, insertError.message)
          
          results.push({
            collection: collectionName,
            status: 'insert_failed',
            error: insertError.message
          })
        }
      } else {
        results.push({
          collection: collectionName,
          status: 'create_failed',
          error: error.message
        })
      }
    }
  }
  
  console.log('=== 数据库初始化完成 ===')
  console.log('结果汇总:', JSON.stringify(results, null, 2))
  
  return {
    success: true,
    message: '数据库初始化完成',
    results: results
  }
}