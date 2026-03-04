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
          <h3>SSO 工程化实现</h3>
          <p>Demo 实现简化版 <strong>CAS 协议</strong>：独立 SSO Server（:4000）+ TGC / ST 票据 + httpOnly SESSIONID Cookie + 子应用服务端 back-channel 验证，复现真实 SSO 核心链路</p>
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

    <!-- SSO 工程化方案 -->
    <div class="sso-section">
      <h2 class="section-title">SSO 工程化方案</h2>

      <!-- 方案对比 -->
      <div class="sso-compare">
        <div class="compare-card">
          <div class="compare-card-label demo">本 Demo 实现（简化版）</div>
          <div class="compare-rows">
            <div class="compare-row"><span class="compare-dot success"></span>独立 SSO Server（Express · :4000）</div>
            <div class="compare-row"><span class="compare-dot success"></span>TGC + ST 票据体系，ST 10 秒一次性消费</div>
            <div class="compare-row"><span class="compare-dot success"></span>httpOnly SESSIONID Cookie + 子应用服务端验证</div>
            <div class="compare-row warn"><span class="compare-dot warn"></span>内存 Map 模拟 Redis，localhost 端口共享模拟父域</div>
            <div class="compare-row warn"><span class="compare-dot warn"></span>webpack-dev-server 中间件模拟业务服务端</div>
          </div>
        </div>
        <div class="compare-vs">VS</div>
        <div class="compare-card real">
          <div class="compare-card-label real">实际工程（美团私有云）</div>
          <div class="compare-rows">
            <div class="compare-row"><span class="compare-dot success"></span>CAS 协议：TGC + Service Ticket 票据体系</div>
            <div class="compare-row"><span class="compare-dot success"></span>Redis 集群持久化 Session，多服务配置互信</div>
            <div class="compare-row"><span class="compare-dot success"></span>父域 Cookie（.sankuai.com）全子域自动携带</div>
            <div class="compare-row"><span class="compare-dot success"></span>真实业务服务端（Spring/Node）+ Nginx 鉴权</div>
          </div>
        </div>
      </div>

      <!-- CAS 时序流程 -->
      <div class="sso-flow-card">
        <div class="flow-card-title">CAS 认证时序 · 本 Demo 实现（:3000 Shell / :4000 SSO / :3001&amp;:3002 Remote）</div>
        <div class="flow-steps">

          <div class="flow-step">
            <div class="step-idx">①</div>
            <div class="step-main">
              <div class="step-route">
                <span class="actor-tag browser">浏览器</span>
                <span class="step-arr">→</span>
                <span class="actor-tag app">Shell :3000</span>
                <span class="step-note">（webpack-dev-server 中间件）</span>
              </div>
              <div class="step-detail"><code>GET /</code>，Accept: text/html，无有效 SESSIONID Cookie → 中间件 302 至 <code>localhost:4000/login?service=http://localhost:3000</code></div>
            </div>
          </div>

          <div class="flow-step">
            <div class="step-idx">②</div>
            <div class="step-main">
              <div class="step-route">
                <span class="actor-tag browser">浏览器</span>
                <span class="step-arr">→</span>
                <span class="actor-tag sso">SSO :4000</span>
              </div>
              <div class="step-detail">用户输入账密，<code>POST /login</code> → 验证通过 → <code>Set-Cookie: TGC</code>（httpOnly，仅 :4000 域）→ 生成一次性 ST（10 秒过期）→ 302 带 <code>?ticket=ST-xxx</code> 跳回 Shell</div>
            </div>
          </div>

          <div class="flow-step">
            <div class="step-idx">③</div>
            <div class="step-main">
              <div class="step-route">
                <span class="actor-tag app">Shell :3000</span>
                <span class="step-arr">⇄</span>
                <span class="actor-tag sso">SSO :4000</span>
                <span class="step-note">（服务端 back-channel，浏览器不可见）</span>
              </div>
              <div class="step-detail"><code>GET /api/validate?ticket=ST-xxx&service=...</code> → SSO 返回 <code>&#123; username, role &#125;</code>（非密码）→ ST 立即从 Store 删除，防止重放攻击</div>
            </div>
          </div>

          <div class="flow-step">
            <div class="step-idx">④</div>
            <div class="step-main">
              <div class="step-route">
                <span class="actor-tag app">Shell :3000</span>
                <span class="step-arr">→</span>
                <span class="actor-tag sso">SSO :4000</span>
                <span class="step-arr">→</span>
                <span class="actor-tag browser">浏览器</span>
              </div>
              <div class="step-detail"><code>POST /api/session</code> 在 SSO 内存 Map 中创建 Session → Shell 响应 <code>Set-Cookie: SESSIONID</code>（httpOnly · localhost，端口无关，:3001/:3002 请求自动携带）→ 302 跳回干净 URL</div>
            </div>
          </div>

          <div class="flow-step">
            <div class="step-idx">⑤</div>
            <div class="step-main">
              <div class="step-route">
                <span class="actor-tag browser">浏览器</span>
                <span class="step-arr">→</span>
                <span class="actor-tag app">Shell :3000</span>
                <span class="step-arr">→</span>
                <span class="actor-tag sso">SSO :4000</span>
              </div>
              <div class="step-detail">Vue 应用初始化，<code>GET /__session</code>（携带 SESSIONID）→ Shell 中间件向 SSO <code>GET /api/session/:id</code> 验证 → 返回用户信息，Pinia Store 更新，顶栏显示用户名</div>
            </div>
          </div>

          <div class="flow-step">
            <div class="step-idx">⑥</div>
            <div class="step-main">
              <div class="step-route">
                <span class="actor-tag browser">浏览器</span>
                <span class="step-arr">→</span>
                <span class="actor-tag sub">Remote :3001/:3002</span>
                <span class="step-arr">⇄</span>
                <span class="actor-tag sso">SSO :4000</span>
              </div>
              <div class="step-detail">子应用组件 <code>fetch /__auth, credentials:include</code>（SESSIONID 随请求自动携带）→ Remote devServer 向 SSO 验证 → 返回 <code>&#123; valid, username, role &#125;</code> → 组件顶部显示 SSO 认证标识</div>
            </div>
          </div>

        </div>
      </div>

      <!-- 关键设计要点 -->
      <div class="sso-keys">
        <div class="key-card">
          <div class="key-title">ST 一次性消费</div>
          <div class="key-desc">验证后立即从内存 Map 删除，防止 URL 劫持重放攻击；Demo 中额外设 10 秒过期定时清理</div>
        </div>
        <div class="key-card">
          <div class="key-title">TGC 域隔离</div>
          <div class="key-desc">TGC Cookie 设在 SSO :4000，业务服务器无法读取；SSO 免密登录（再次访问自动签发 ST）与完整登出均依赖此 Cookie</div>
        </div>
        <div class="key-card">
          <div class="key-title">Cookie 端口共享</div>
          <div class="key-desc">浏览器 Cookie 按 host 匹配而非 host:port，SESSIONID 设在 localhost 后 :3001/:3002 请求自动携带，模拟生产环境父域共享</div>
        </div>
        <div class="key-card">
          <div class="key-title">服务端 back-channel 验证</div>
          <div class="key-desc">ST 验证与 Session 查询均为服务端对服务端调用，前端 JS 全程不接触票据与 Session 原始数据，符合安全规范</div>
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

/* SSO 工程化方案 */
.sso-section {
  margin-top: 40px;
}

/* 方案对比 */
.sso-compare {
  display: flex;
  align-items: stretch;
  gap: 0;
  margin-bottom: 16px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.compare-card {
  flex: 1;
  padding: 16px 20px;
}

.compare-card.real {
  background: rgba(34, 197, 94, 0.04);
  border-left: 1px solid var(--border);
}

.compare-card-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.6px;
  margin-bottom: 12px;
}

.compare-card-label.demo { color: var(--accent); }
.compare-card-label.real { color: var(--success); }

.compare-rows {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.compare-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--text-secondary);
}

.compare-row.warn { color: var(--text-muted); }

.compare-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.compare-dot.accent { background: var(--accent); }
.compare-dot.success { background: var(--success); }
.compare-dot.warn { background: #f59e0b; }

.compare-vs {
  display: flex;
  align-items: center;
  padding: 0 16px;
  font-size: 11px;
  font-weight: 700;
  color: var(--text-muted);
  letter-spacing: 1px;
  border-left: 1px solid var(--border);
  border-right: 1px solid var(--border);
  background: var(--bg-elevated);
}

/* CAS 时序流程 */
.sso-flow-card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  margin-bottom: 16px;
}

.flow-card-title {
  padding: 10px 16px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  background: var(--bg-elevated);
  border-bottom: 1px solid var(--border);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.flow-steps {
  padding: 8px 0;
}

.flow-step {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 20px;
  border-bottom: 1px solid var(--border);
  transition: background var(--transition);
}

.flow-step:last-child { border-bottom: none; }
.flow-step:hover { background: var(--bg-elevated); }

.step-idx {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--accent-dim);
  color: var(--accent);
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1px;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.step-main {
  flex: 1;
  min-width: 0;
}

.step-route {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}

.actor-tag {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
  white-space: nowrap;
}

.actor-tag.browser { background: var(--bg-elevated); color: var(--text-secondary); border: 1px solid var(--border); }
.actor-tag.app     { background: var(--accent-dim); color: var(--accent); border: 1px solid rgba(59,130,246,0.3); }
.actor-tag.sso     { background: rgba(245, 158, 11, 0.12); color: #f59e0b; border: 1px solid rgba(245,158,11,0.3); }
.actor-tag.redis   { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239,68,68,0.25); }
.actor-tag.sub     { background: rgba(168, 85, 247, 0.12); color: #a855f7; border: 1px solid rgba(168,85,247,0.3); }

.step-arr {
  font-size: 13px;
  color: var(--text-muted);
}

.step-note {
  font-size: 10px;
  color: var(--text-muted);
  font-style: italic;
}

.step-detail {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.6;
}

.step-detail code {
  font-family: monospace;
  font-size: 11px;
  background: var(--bg-elevated);
  padding: 1px 5px;
  border-radius: 3px;
  color: var(--accent);
}

.step-detail strong { color: var(--text-primary); font-weight: 600; }

/* 关键设计要点 */
.sso-keys {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.key-card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 14px;
  transition: border-color var(--transition);
}

.key-card:hover { border-color: var(--border-hover); }

.key-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 6px;
}

.key-desc {
  font-size: 11px;
  color: var(--text-muted);
  line-height: 1.6;
}
</style>
