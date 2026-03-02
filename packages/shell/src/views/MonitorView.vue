<script setup lang="ts">
import { defineAsyncComponent, ref } from 'vue';

const loadError = ref<string | null>(null);

/**
 * 核心：defineAsyncComponent 懒加载远程组件
 *
 * import('remoteMonitor/MonitorDashboard') 触发时：
 * 1. webpack 检查 remoteMonitor 的 remoteEntry.js 是否已加载
 * 2. 若未加载，动态插入 <script src="http://localhost:3001/remoteEntry.js">
 * 3. 执行 shared 模块版本协商（确保 Vue 单例）
 * 4. 从 remote 容器中 get('./MonitorDashboard') 并返回工厂函数
 * 5. 执行工厂函数，返回组件
 */
const MonitorDashboard = defineAsyncComponent({
  loader: () =>
    import('remoteMonitor/MonitorDashboard').catch((err) => {
      loadError.value = `无法加载 remote-monitor 模块。\n请确认 remote-monitor 正在 localhost:3001 运行。\n\n错误详情: ${err.message}`;
      throw err;
    }),
  // 加载中显示骨架屏
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
  // 加载失败显示 Fallback
  errorComponent: {
    template: `<div></div>`, // 由外层 loadError 处理
  },
  delay: 200,
  timeout: 15000,
});
</script>

<template>
  <div class="monitor-view fade-in">
    <!-- Remote 来源标签 -->
    <div class="remote-badge-bar">
      <span class="source-badge">
        <span class="source-dot"></span>
        来自 &nbsp;<code>remoteMonitor</code>&nbsp; · localhost:3001/remoteEntry.js
      </span>
    </div>

    <!-- 加载失败的 Fallback UI -->
    <div v-if="loadError" class="error-boundary">
      <div class="error-icon">⚠️</div>
      <h3>远程模块加载失败</h3>
      <pre class="error-msg">{{ loadError }}</pre>
      <p class="error-hint">这正是微前端容错降级机制的体现：Remote 故障不影响 Shell 宿主应用正常运行。</p>
      <button class="retry-btn" @click="loadError = null; $forceUpdate()">重试</button>
    </div>

    <!-- 成功加载的远程组件 -->
    <MonitorDashboard v-else />
  </div>
</template>

<style scoped>
.monitor-view { animation: fadeIn 0.3s ease; }

.remote-badge-bar {
  margin-bottom: 16px;
}

.source-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-muted);
  background: var(--bg-surface);
  border: 1px solid var(--border);
  padding: 4px 12px;
  border-radius: 20px;
}

.source-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--success);
  animation: pulse 2s infinite;
}

.source-badge code {
  color: var(--accent);
  font-size: 11px;
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
.skeleton-btn { height: 32px; width: 80px; border-radius: 6px; }

.loading-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.skeleton-card { height: 130px; }
.skeleton-chart { height: 200px; margin-bottom: 16px; }

.loading-tip {
  font-size: 12px;
  color: var(--text-muted);
  text-align: center;
  animation: pulse 1.5s infinite;
}

/* 错误 UI */
.error-boundary {
  background: var(--bg-surface);
  border: 1px solid var(--error);
  border-radius: var(--radius-lg);
  padding: 32px;
  text-align: center;
  animation: fadeIn 0.3s ease;
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
  margin-bottom: 20px;
  line-height: 1.6;
}

.retry-btn {
  padding: 8px 20px;
  border-radius: 6px;
  background: var(--accent);
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  transition: background var(--transition);
}

.retry-btn:hover { background: var(--accent-hover); }
</style>
