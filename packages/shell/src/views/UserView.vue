<script setup lang="ts">
import { defineAsyncComponent, ref } from 'vue';

const loadError = ref<string | null>(null);

const UserManagement = defineAsyncComponent({
  loader: () =>
    import('remoteUser/UserManagement').catch((err) => {
      loadError.value = `无法加载 remote-user 模块。\n请确认 remote-user 正在 localhost:3002 运行。\n\n错误详情: ${err.message}`;
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
  <div class="user-view fade-in">
    <div class="remote-badge-bar">
      <span class="source-badge">
        <span class="source-dot"></span>
        来自 &nbsp;<code>remoteUser</code>&nbsp; · localhost:3002/remoteEntry.js
      </span>
    </div>

    <div v-if="loadError" class="error-boundary">
      <div class="error-icon">⚠️</div>
      <h3>远程模块加载失败</h3>
      <pre class="error-msg">{{ loadError }}</pre>
      <p class="error-hint">Shell 宿主应用正常运行，仅该 Remote 模块不可用。</p>
    </div>

    <UserManagement v-else />
  </div>
</template>

<style scoped>
.user-view { animation: fadeIn 0.3s ease; }

.remote-badge-bar { margin-bottom: 16px; }

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
  background: #a855f7;
  animation: pulse 2s infinite;
}

.source-badge code { color: #a855f7; font-size: 11px; }

.remote-loading { animation: fadeIn 0.2s ease; }

.loading-header {
  display: flex;
  justify-content: space-between;
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

.skeleton-title { height: 24px; width: 160px; }
.skeleton-btn { height: 32px; width: 100px; }
.skeleton-table-header { height: 40px; margin-bottom: 8px; border-radius: 6px 6px 0 0; }
.skeleton-row { height: 52px; margin-bottom: 4px; }

.loading-tip {
  font-size: 12px;
  color: var(--text-muted);
  text-align: center;
  margin-top: 12px;
  animation: pulse 1.5s infinite;
}

.error-boundary {
  background: var(--bg-surface);
  border: 1px solid var(--error);
  border-radius: var(--radius-lg);
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
}

.error-hint { font-size: 13px; color: var(--text-muted); }
</style>
