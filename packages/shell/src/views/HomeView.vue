<script setup lang="ts">
import { useRouter } from 'vue-router';
const router = useRouter();
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
            <!-- Shell -->
            <div class="arch-shell">
              <div class="arch-app-label">Shell（宿主应用）</div>
              <div class="arch-app-desc">Vue Router · Pinia · 布局</div>
              <div class="arch-remotes">
                <div class="arch-slot active" @click="router.push('/monitor')">
                  <span class="slot-dot loaded"></span>
                  <span>MonitorDashboard</span>
                  <span class="slot-from">← remote-monitor</span>
                </div>
                <div class="arch-slot active" @click="router.push('/users')">
                  <span class="slot-dot loaded"></span>
                  <span>UserManagement</span>
                  <span class="slot-from">← remote-user</span>
                </div>
              </div>
            </div>

            <!-- 箭头 + 远程应用 -->
            <div class="arch-right">
              <div class="arch-remote-app">
                <div class="remote-header">
                  <span class="remote-badge monitor">Remote</span>
                  remote-monitor
                </div>
                <div class="remote-url">:3001/remoteEntry.js</div>
                <div class="remote-exposes">exposes: MonitorDashboard</div>
              </div>
              <div class="arch-arrow">
                <div class="arrow-line"></div>
                <div class="arrow-label">Module Federation</div>
                <div class="arrow-label small">shared: vue · pinia</div>
              </div>
              <div class="arch-remote-app">
                <div class="remote-header">
                  <span class="remote-badge user">Remote</span>
                  remote-user
                </div>
                <div class="remote-url">:3002/remoteEntry.js</div>
                <div class="remote-exposes">exposes: UserManagement</div>
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

    <!-- CTA -->
    <div class="cta-section">
      <button class="cta-btn primary" @click="router.push('/monitor')">
        查看服务监控面板 →
      </button>
      <button class="cta-btn secondary" @click="router.push('/users')">
        查看用户管理 →
      </button>
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
  display: flex;
  gap: 0;
  padding: 24px;
  align-items: stretch;
}

.arch-shell {
  flex: 1;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px;
}

.arch-app-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--accent);
  margin-bottom: 4px;
}

.arch-app-desc {
  font-size: 11px;
  color: var(--text-muted);
  margin-bottom: 16px;
}

.arch-remotes {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.arch-slot {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: var(--bg-primary);
  border: 1px dashed var(--border);
  border-radius: 6px;
  font-size: 12px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition);
}

.arch-slot.active {
  border-color: var(--success);
  border-style: solid;
}

.arch-slot.active:hover {
  background: var(--success-dim);
  color: var(--success);
}

.slot-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--text-muted);
  flex-shrink: 0;
}

.slot-dot.loaded { background: var(--success); }

.slot-from {
  margin-left: auto;
  font-size: 10px;
  color: var(--text-muted);
  font-family: monospace;
}

.arch-right {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0 24px;
  gap: 12px;
}

.arch-arrow {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.arrow-line {
  width: 2px;
  height: 20px;
  background: linear-gradient(to bottom, var(--accent), transparent);
}

.arrow-label {
  font-size: 10px;
  color: var(--accent);
  font-weight: 500;
  text-align: center;
  white-space: nowrap;
}

.arrow-label.small { color: var(--text-muted); }

.arch-remote-app {
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 12px 14px;
  min-width: 180px;
}

.remote-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 6px;
}

.remote-badge {
  font-size: 9px;
  padding: 1px 6px;
  border-radius: 3px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.remote-badge.monitor { background: var(--accent-dim); color: var(--accent); }
.remote-badge.user { background: rgba(168, 85, 247, 0.15); color: #a855f7; }

.remote-url {
  font-size: 10px;
  color: var(--text-muted);
  font-family: monospace;
  margin-bottom: 4px;
}

.remote-exposes {
  font-size: 10px;
  color: var(--success);
  font-family: monospace;
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

/* CTA */
.cta-section {
  display: flex;
  gap: 12px;
}

.cta-btn {
  padding: 10px 24px;
  border-radius: var(--radius);
  font-size: 14px;
  font-weight: 500;
  transition: all var(--transition);
}

.cta-btn.primary {
  background: var(--accent);
  color: #fff;
}

.cta-btn.primary:hover { background: var(--accent-hover); }

.cta-btn.secondary {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  color: var(--text-primary);
}

.cta-btn.secondary:hover {
  border-color: var(--border-hover);
  background: var(--bg-elevated);
}
</style>
