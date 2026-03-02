# 微前端模块联邦架构 Demo

基于 **Webpack 5 Module Federation** 实现的微前端作品集项目，将多个独立部署的 Vue 3 应用聚合到同一运行时，展示按需加载、依赖共享与跨应用 SSO 状态同步等核心能力。

**在线体验 →** [shell-liart.vercel.app](https://shell-liart.vercel.app)

---

## 架构总览

```
Browser Runtime
│
├── Shell（宿主应用）                  Port 3000 / shell-liart.vercel.app
│   ├── Vue Router（路由管理）
│   ├── Pinia（全局状态 / SSO）
│   └── 动态加载远程模块
│         │
│         ├── remoteMonitor/MonitorDashboard   ← remote-monitor.vercel.app/remoteEntry.js
│         └── remoteUser/UserManagement        ← remote-user-sage.vercel.app/remoteEntry.js
│
├── remote-monitor（远程模块 1）        Port 3001 / remote-monitor.vercel.app
│   └── 暴露: MonitorDashboard.vue
│
└── remote-user（远程模块 2）           Port 3002 / remote-user-sage.vercel.app
    └── 暴露: UserManagement.vue
```

三个应用**完全独立部署**，Shell 在运行时动态拉取 Remote 模块，无需重新构建即可完成功能迭代。

---

## 技术亮点

### 1. Bootstrap 异步启动模式

Module Federation 的 shared 模块是异步协商加载的，若 entry chunk 同步执行会抛出：
> `Uncaught Error: Shared module is not available for eager consumption`

通过将应用初始化拆分为两个文件解决：

```ts
// src/main.ts —— webpack entry，仅做动态 import
import('./bootstrap');

// src/bootstrap.ts —— 真正的 Vue 应用初始化
import { createApp } from 'vue';
import App from './App.vue';
// ...
```

### 2. 模块联邦核心配置

**Shell（Host）：**

```js
new ModuleFederationPlugin({
  name: 'shell',
  remotes: {
    remoteMonitor: `remoteMonitor@${REMOTE_MONITOR_URL}/remoteEntry.js`,
    remoteUser:    `remoteUser@${REMOTE_USER_URL}/remoteEntry.js`,
  },
  shared: {
    vue:          { singleton: true, requiredVersion: '^3.4.0' },
    'vue-router': { singleton: true, requiredVersion: '^4.2.5' },
    pinia:        { singleton: true, requiredVersion: '^2.1.7' },
  },
})
```

**Remote（以 remote-monitor 为例）：**

```js
new ModuleFederationPlugin({
  name: 'remoteMonitor',
  filename: 'remoteEntry.js',          // Shell 通过此文件加载该模块
  exposes: {
    './MonitorDashboard': './src/components/MonitorDashboard.vue',
  },
  shared: { vue: { singleton: true } }, // 与 Shell 共享同一 Vue 实例
})
```

`singleton: true` 确保 Vue、Pinia 在所有模块间只实例化一次，避免 `provide/inject` 失效等多实例问题。

### 3. 懒加载 + Error Boundary

Shell 通过 `defineAsyncComponent` 懒加载远程组件，内置骨架屏与错误降级：

```ts
const MonitorDashboard = defineAsyncComponent({
  loader: () =>
    import('remoteMonitor/MonitorDashboard').catch(err => {
      loadError.value = err.message; // Remote 故障时展示 Fallback UI
      throw err;
    }),
  loadingComponent: SkeletonScreen,   // 加载中显示骨架屏
  delay: 200,
  timeout: 15000,
});
```

**Remote 故障不影响 Shell 宿主应用正常运行** —— 这正是微前端架构的核心价值之一。

### 4. 跨模块 SSO 状态同步

```ts
// stores/auth.ts（Shell 侧）
function login() {
  // ① Pinia store：页面内所有 Remote 模块通过共享 pinia 实例读取
  user.value = mockUser;
  token.value = mockToken;

  // ② localStorage：支持独立运行的 Remote 与跨 Tab 场景
  localStorage.setItem('mf_auth_token', mockToken);
  localStorage.setItem('mf_auth_user', JSON.stringify(mockUser));
}

// 监听跨 Tab 登出
window.addEventListener('storage', e => {
  if (e.key === 'mf_auth_token' && !e.newValue) logout();
});
```

### 5. 跨域配置（Vercel）

Remote 服务在 `vercel.json` 中配置 CORS 响应头，允许 Shell 跨域加载 `remoteEntry.js`：

```json
{
  "headers": [{
    "source": "/(.*)",
    "headers": [
      { "key": "Access-Control-Allow-Origin", "value": "*" }
    ]
  }]
}
```

---

## 项目结构

```
micro-frontend-demo/
├── package.json                      # Monorepo 根（npm workspaces）
└── packages/
    ├── shell/                        # 宿主应用
    │   ├── webpack.config.js         # MF Host 配置
    │   ├── vercel.json
    │   └── src/
    │       ├── main.ts               # Bootstrap 入口
    │       ├── bootstrap.ts          # 应用初始化
    │       ├── App.vue               # 布局（Sidebar + TopBar + RouterView）
    │       ├── router/index.ts
    │       ├── stores/auth.ts        # SSO Store
    │       ├── types/remote.d.ts     # 远程模块类型声明
    │       └── views/
    │           ├── HomeView.vue      # 架构可视化首页
    │           ├── MonitorView.vue   # 加载 remoteMonitor
    │           └── UserView.vue      # 加载 remoteUser
    ├── remote-monitor/               # 监控面板 Remote
    │   ├── webpack.config.js         # MF Remote 配置（exposes）
    │   └── src/components/
    │       └── MonitorDashboard.vue  # 服务状态卡 + 拓扑图 + 告警列表
    └── remote-user/                  # 用户管理 Remote
        ├── webpack.config.js
        └── src/components/
            └── UserManagement.vue    # 用户表格 + 搜索筛选 + 添加弹窗
```

---

## 本地运行

```bash
# 安装依赖（Monorepo 根目录执行）
npm install

# 同时启动三个服务（需要 concurrently）
npm run dev
```

| 服务 | 地址 |
|------|------|
| Shell | http://localhost:3000 |
| remote-monitor | http://localhost:3001 |
| remote-user | http://localhost:3002 |

访问 `http://localhost:3000` 体验完整效果。

---

## Vercel 部署

三个应用分别作为独立 Vercel 项目部署，**部署顺序：Remote 先，Shell 后**（Shell 的 webpack 配置依赖 Remote URL）。

```bash
# 1. 部署 remote-monitor
cd packages/remote-monitor && vercel --prod --yes

# 2. 部署 remote-user
cd packages/remote-user && vercel --prod --yes

# 3. 将 Remote URL 写入 shell/webpack.config.js 后部署 Shell
cd packages/shell && vercel --prod --yes
```

如需自定义 Remote URL，在 Vercel 项目设置中添加环境变量：

| 变量 | 说明 |
|------|------|
| `REMOTE_MONITOR_URL` | remote-monitor 的部署域名 |
| `REMOTE_USER_URL` | remote-user 的部署域名 |

---

## 技术栈

| 层 | 技术 |
|----|------|
| 框架 | Vue 3 + TypeScript |
| 构建 | Webpack 5 + Module Federation |
| 状态 | Pinia |
| 路由 | Vue Router 4 |
| 工程化 | npm Workspaces（Monorepo） |
| 部署 | Vercel |

---

## 背景

本项目为**脱敏还原**版本，核心架构思路来源于美团私有云服务高可用保障平台的实际工程经验：

> 改造 micro-app SDK，使其支持通过域名定位符加载 Webpack 模块联邦，并解决跨域、SSO 等模块加载工程问题。
