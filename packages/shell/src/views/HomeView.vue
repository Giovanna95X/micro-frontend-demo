<script setup lang="ts">
import { defineAsyncComponent, ref } from 'vue';

const monitorError = ref<string | null>(null);
const userError = ref<string | null>(null);

const MonitorDashboard = defineAsyncComponent({
  loader: () =>
    import('remoteMonitor/MonitorDashboard').catch((err) => {
      monitorError.value = `无法加载 remote-monitor 模块。\n请确认 remote-monitor 正在 localhost:3001 运行。\n\n错误详情: ${err.message}`;
      throw err;
    }),
  loadingComponent: {
    template: `
      <div class="remote-loading">
        <div class="loading-header">
          <div class="skeleton skeleton-title"></div>
          <div class="skeleton skeleton-btn"></div>
        </div>
        <div class="loading-cards">
          <div v-for="i in 4" :key="i" class="skeleton skeleton-card"></div>
        </div>
        <div class="skeleton skeleton-chart"></div>
        <p class="loading-tip">正在从 remote-monitor 加载组件...</p>
      </div>
    `,
  },
  errorComponent: { template: '<div></div>' },
  delay: 200,
  timeout: 15000,
});

const UserManagement = defineAsyncComponent({
  loader: () =>
    import('remoteUser/UserManagement').catch((err) => {
      userError.value = `无法加载 remote-user 模块。\n请确认 remote-user 正在 localhost:3002 运行。\n\n错误详情: ${err.message}`;
      throw err;
    }),
  loadingComponent: {
    template: `
      <div class="remote-loading">
        <div class="loading-header">
          <div class="skeleton skeleton-title"></div>
          <div class="skeleton skeleton-btn"></div>
        </div>
        <div class="skeleton skeleton-table-header"></div>
        <div v-for="i in 6" :key="i" class="skeleton skeleton-row"></div>
        <p class="loading-tip">正在从 remote-user 加载组件...</p>
      </div>
    `,
  },
  errorComponent: { template: '<div></div>' },
  delay: 200,
  timeout: 15000,
});
</script>

<template>
  <div class="home fade-in">
    <!-- Hero -->
    <div class="hero">
      <div class="hero-tag">作品集 · 技术方案还原</div>
      <h1 class="hero-title">微前端 · 模块联邦架构</h1>
      <p class="hero-desc">
        基于 Webpack 5 Module Federation，将多个独立部署的 Vue 3 应用聚合到同一运行时，
        实现按需加载、依赖共享与跨应用 SSO 状态同步。
      </p>
      <p class="hero-bg">
        💼 &nbsp;源于美团私有云服务高可用保障平台实践——改造 micro-app SDK，
        使其支持通过域名定位符加载 Webpack 模块联邦，并解决跨域、SSO 等工程问题。
      </p>
    </div>

    <!-- 架构图 -->
    <div class="arch-section">
      <h2 class="section-title">运行时架构</h2>
      <div class="arch-diagram">
        <div class="arch-browser">
          <div class="browser-bar">
            <span class="browser-dot" style="background:#ef4444"></span>
            <span class="browser-dot" style="background:#f59e0b"></span>
            <span class="browser-dot" style="background:#22c55e"></span>
            <span class="browser-url">mf-shell.vercel.app</span>
          </div>
          <div class="arch-inner">
            <div class="arch-shell">
              <div class="arch-shell-header">
                <div class="arch-app-label">Shell（宿主应用）</div>
                <div class="arch-app-desc">Vue Router · Pinia · 布局</div>
              </div>
              <div class="arch-slots">
                <!-- MonitorDashboard slot -->
                <div class="arch-slot-panel">
                  <div class="slot-bar monitor-bar">
                    <span class="slot-dot loaded"></span>
                    <span class="slot-name">MonitorDashboard</span>
                    <span class="slot-from">← remote-monitor · :3001/remoteEntry.js</span>
                  </div>
                  <div class="slot-body">
                    <div v-if="monitorError" class="error-boundary">
                      <div class="error-icon">⚠️</div>
                      <h3>远程模块加载失败</h3>
                      <pre class="error-msg">{{ monitorError }}</pre>
                      <p class="error-hint">容错降级：Remote 故障不影响 Shell 正常运行。</p>
                    </div>
                    <MonitorDashboard v-else />
                  </div>
                </div>
                <!-- UserManagement slot -->
                <div class="arch-slot-panel">
                  <div class="slot-bar user-bar">
                    <span class="slot-dot user-dot"></span>
                    <span class="slot-name">UserManagement</span>
                    <span class="slot-from">← remote-user · :3002/remoteEntry.js</span>
                  </div>
                  <div class="slot-body">
                    <div v-if="userError" class="error-boundary">
                      <div class="error-icon">⚠️</div>
                      <h3>远程模块加载失败</h3>
                      <pre class="error-msg">{{ userError }}</pre>
                      <p class="error-hint">Shell 宿主应用正常运行，仅该 Remote 模块不可用。</p>
                    </div>
                    <UserManagement v-else />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 技术亮点 -->
    <div class="highlights-section">
      <h2 class="section-title">技术亮点</h2>
      <div class="highlights-grid">
        <div class="highlight-card">
          <div class="highlight-icon">⚡</div>
          <h3>按需加载</h3>
          <p>Remote 组件通过 <code>defineAsyncComponent</code> 懒加载，首屏不引入远程 bundle，命中时才动态拉取</p>
        </div>
        <div class="highlight-card">
          <div class="highlight-icon">🔗</div>
          <h3>依赖共享</h3>
          <p>Webpack shared 配置确保 Vue、Pinia、Vue Router 在所有模块间只实例化一次，避免多实例冲突</p>
        </div>
        <div class="highlight-card">
          <div class="highlight-icon">🛡️</div>
          <h3>SSO 状态同步</h3>
          <p>Pinia store（页面内同步）+ localStorage（跨 Tab 同步），Remote 模块无需重新登录即可获取认证状态</p>
        </div>
        <div class="highlight-card">
          <div class="highlight-icon">🔄</div>
          <h3>容错降级</h3>
          <p>Remote 加载失败时 Error Boundary 捕获错误，展示 Fallback UI，宿主应用不崩溃，用户体验不中断</p>
        </div>
        <div class="highlight-card">
          <div class="highlight-icon">🚀</div>
          <h3>独立部署</h3>
          <p>每个 Remote 独立构建发布，无需重新部署 Shell，真正实现子团队自治与持续交付</p>
        </div>
        <div class="highlight-card">
          <div class="highlight-icon">🌐</div>
          <h3>跨域解决方案</h3>
          <p>Remote 服务设置 CORS 响应头，Shell 加载跨域 remoteEntry.js 时不受同源策略限制</p>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.home { max-width: 900px; }

/* Hero */
.hero {
  margin-bottom: 40px;
}

.hero-tag {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  background: var(--accent-dim);
  color: var(--accent);
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 12px;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.hero-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 12px;
  letter-spacing: -0.5px;
}

.hero-desc {
  font-size: 15px;
  color: var(--text-secondary);
  line-height: 1.7;
  max-width: 680px;
  margin-bottom: 14px;
}

.hero-bg {
  font-size: 13px;
  color: var(--text-muted);
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-left: 3px solid var(--accent);
  padding: 10px 14px;
  border-radius: 0 var(--radius) var(--radius) 0;
  line-height: 1.6;
}

/* 架构图 */
.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 16px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.arch-section { margin-bottom: 40px; }

.arch-diagram {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.arch-browser {
  padding: 0;
}

.browser-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: var(--bg-elevated);
  border-bottom: 1px solid var(--border);
}

.browser-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.browser-url {
  margin-left: 8px;
  font-size: 12px;
  color: var(--text-muted);
  background: var(--bg-surface);
  padding: 2px 12px;
  border-radius: 4px;
  border: 1px solid var(--border);
}

.arch-inner {
  padding: 16px;
}

.arch-shell {
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}

.arch-shell-header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
}

.arch-app-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--accent);
  margin-bottom: 2px;
}

.arch-app-desc {
  font-size: 11px;
  color: var(--text-muted);
}

.arch-slots {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.arch-slot-panel {
  border-top: 1px solid var(--border);
}

.arch-slot-panel:first-child {
  border-top: none;
}

.slot-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border);
  font-size: 12px;
  color: var(--text-secondary);
}

.monitor-bar { border-left: 3px solid var(--success); }
.user-bar { border-left: 3px solid #a855f7; }

.slot-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
  animation: pulse 2s infinite;
}

.slot-dot.loaded { background: var(--success); }
.user-dot { background: #a855f7; }

.slot-name {
  font-weight: 500;
  color: var(--text-primary);
}

.slot-from {
  margin-left: auto;
  font-size: 10px;
  color: var(--text-muted);
  font-family: monospace;
}

.slot-body {
  padding: 16px;
}

/* 技术亮点 */
.highlights-section { margin-bottom: 32px; }

.highlights-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.highlight-card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px;
  transition: border-color var(--transition);
}

.highlight-card:hover { border-color: var(--border-hover); }

.highlight-icon { font-size: 20px; margin-bottom: 10px; }

.highlight-card h3 {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 6px;
}

.highlight-card p {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.6;
}

.highlight-card code {
  font-family: monospace;
  font-size: 11px;
  background: var(--bg-elevated);
  padding: 1px 4px;
  border-radius: 3px;
  color: var(--accent);
}

/* 骨架屏 */
.remote-loading { animation: fadeIn 0.2s ease; }

.loading-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.skeleton {
  background: linear-gradient(90deg, var(--bg-surface) 25%, var(--bg-elevated) 50%, var(--bg-surface) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 6px;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.skeleton-title { height: 24px; width: 200px; }
.skeleton-btn { height: 32px; width: 80px; }

.loading-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.skeleton-card { height: 130px; }
.skeleton-chart { height: 200px; margin-bottom: 16px; }
.skeleton-table-header { height: 40px; margin-bottom: 8px; }
.skeleton-row { height: 52px; margin-bottom: 4px; }

.loading-tip {
  font-size: 12px;
  color: var(--text-muted);
  text-align: center;
  margin-top: 12px;
  animation: pulse 1.5s infinite;
}

/* 错误边界 */
.error-boundary {
  padding: 32px;
  text-align: center;
}

.error-icon { font-size: 36px; margin-bottom: 12px; }

.error-boundary h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--error);
  margin-bottom: 12px;
}

.error-msg {
  font-family: monospace;
  font-size: 12px;
  color: var(--text-secondary);
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  padding: 12px 16px;
  border-radius: 6px;
  text-align: left;
  margin-bottom: 12px;
  white-space: pre-wrap;
  word-break: break-all;
}

.error-hint {
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.6;
}
</style>
