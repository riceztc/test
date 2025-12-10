# 简单记账本小程序

这是一个最简单的微信小程序项目，演示了前端和后端是如何联通的。

## 项目结构

```
├── app.js                    # 小程序入口文件
├── app.json                  # 小程序配置文件
├── app.wxss                  # 全局样式文件
├── project.config.json       # 项目配置文件
├── sitemap.json             # 站点地图配置
├── pages/                   # 页面目录
│   ├── index/               # 首页
│   │   ├── index.js
│   │   ├── index.json
│   │   ├── index.wxml
│   │   └── index.wxss
│   ├── list/                # 列表页
│   │   ├── list.js
│   │   ├── list.json
│   │   ├── list.wxml
│   │   └── list.wxss
│   └── detail/              # 详情页
│       ├── detail.js
│       ├── detail.json
│       ├── detail.wxml
│       └── detail.wxss
└── cloudfunctions/          # 云函数目录
    ├── getBills/            # 获取账单列表
    ├── addBill/             # 添加账单
    ├── getBillDetail/       # 获取账单详情
    ├── updateBill/          # 更新账单
    ├── deleteBill/          # 删除账单
    └── getTodayStats/       # 获取今日统计
```

## 功能说明

### 前端（小程序页面）
- **首页**: 显示今日统计，提供导航按钮
- **列表页**: 显示所有账单，支持筛选
- **详情页**: 添加/编辑账单

### 后端（云函数）
- **getBills**: 获取账单列表，支持按类型筛选
- **addBill**: 添加新账单
- **getBillDetail**: 获取单个账单详情
- **updateBill**: 更新账单信息
- **deleteBill**: 删除账单
- **getTodayStats**: 获取今日支出统计

## 前后端联通原理

### 1. 数据流向
```
前端页面 → 云函数 → 云数据库 → 返回结果 → 前端更新界面
```

### 2. 调用方式
前端通过 `wx.cloud.callFunction()` 调用云函数：

```javascript
// 示例：获取账单列表
wx.cloud.callFunction({
  name: 'getBills',
  data: {
    type: '支出'  // 传递给云函数的参数
  },
  success: res => {
    // 处理云函数返回的结果
    this.setData({
      bills: res.result.data
    })
  },
  fail: err => {
    // 处理错误
    console.error('获取失败:', err)
  }
})
```

### 3. 云函数处理
云函数接收请求，处理业务逻辑，操作数据库：

```javascript
// 云函数示例
exports.main = async (event, context) => {
  const { type } = event  // 接收前端传递的参数
  
  // 操作云数据库
  const result = await db.collection('bills')
    .where({ type })
    .get()
  
  return {
    success: true,
    data: result.data  // 返回给前端的数据
  }
}
```

## 运行步骤

1. **准备工作**:
   - 安装微信开发者工具
   - 注册微信小程序账号

2. **配置云开发**:
   - 在微信开发者工具中开通云开发
   - 创建云开发环境
   - 修改 `app.js` 中的环境ID

3. **上传云函数**:
   - 右键点击 cloudfunctions 目录
   - 选择"上传并部署：云端安装依赖"

4. **创建数据库集合**:
   - 在云开发控制台创建 `bills` 集合
   - 设置合适的权限（建议"所有用户可读，仅创建者可写"）

5. **运行项目**:
   - 在微信开发者工具中点击编译
   - 在模拟器中查看效果

## 学习要点

### 前端部分
- **页面结构**: WXML 模板语法
- **样式设计**: WXSS 样式表
- **交互逻辑**: JavaScript 事件处理
- **数据绑定**: 双向数据绑定机制
- **页面跳转**: 路由导航

### 后端部分
- **云函数**: Node.js 运行环境
- **数据库**: 云数据库 CRUD 操作
- **权限控制**: 用户身份验证和数据权限

### 数据交互
- **请求响应**: 异步调用模式
- **错误处理**: 统一的错误处理机制
- **数据格式**: JSON 数据交换格式

## 扩展练习

1. 添加账单分类功能
2. 实现数据图表展示
3. 添加月度统计报表
4. 支持数据导入导出
5. 添加账单搜索功能

这个项目展示了最完整的前后端数据交互流程，是学习小程序开发的绝佳起点。