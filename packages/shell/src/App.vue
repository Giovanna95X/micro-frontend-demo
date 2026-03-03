<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from './stores/auth';

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();

onMounted(() => {
  auth.checkSession();
});

const navItems = [
  { path: '/', name: 'home', label: '架构概览', icon: '⬡' },
  { path: '/monitor', name: 'monitor', label: '服务监控', icon: '◉' },
  { path: '/users', name: 'users', label: '用户管理', icon: '◎' },
];
</script>

<template>
  <div class="app-shell">
    <!-- 侧边栏 -->
    <aside class="sidebar">
      <div class="sidebar-logo">
        <span class="logo-icon">🔗</span>
        <div class="logo-text">
          <span class="logo-title">MF Platform</span>
          <span class="logo-sub">Module Federation</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        <RouterLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ active: route.path === item.path }"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <span class="nav-label">{{ item.label }}</span>
        </RouterLink>
      </nav>

      <div class="sidebar-footer">
        <div class="mf-badge">
          <span class="badge-dot"></span>
          Webpack MF v5
        </div>
      </div>
    </aside>

    <!-- 主区域 -->
    <div class="main-area">
      <!-- 顶部栏 -->
      <header class="topbar">
        <div class="topbar-left">
          <span class="page-title">{{ navItems.find(n => n.path === route.path)?.label || '首页' }}</span>
        </div>
        <div class="topbar-right">
          <div class="user-info" v-if="auth.isLoggedIn">
            <div class="user-avatar">{{ auth.user?.name?.[0] }}</div>
            <div class="user-detail">
              <span class="user-name">{{ auth.user?.name }}</span>
              <span class="user-role">{{ auth.user?.role }}</span>
            </div>
          </div>
          <button class="btn-logout" @click="auth.logout()">登出</button>
        </div>
      </header>

      <!-- 路由视图 -->
      <main class="page-content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped>
.app-shell {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: var(--bg-primary);
}

/* ── 侧边栏 ── */
.sidebar {
  width: var(--sidebar-width);
  background: var(--bg-surface);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px 16px;
  border-bottom: 1px solid var(--border);
}

.logo-icon { font-size: 22px; }

.logo-text {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
}

.logo-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.logo-sub {
  font-size: 10px;
  color: var(--text-muted);
  letter-spacing: 0.5px;
}

.sidebar-nav {
  flex: 1;
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--radius);
  color: var(--text-secondary);
  font-size: 13.5px;
  font-weight: 500;
  transition: all var(--transition);
}

.nav-item:hover {
  background: var(--bg-elevated);
  color: var(--text-primary);
}

.nav-item.active {
  background: var(--accent-dim);
  color: var(--accent);
}

.nav-icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid var(--border);
}

.mf-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--text-muted);
}

.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--success);
  animation: pulse 2s infinite;
}

/* ── 主区域 ── */
.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.topbar {
  height: var(--topbar-height);
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  flex-shrink: 0;
}

.page-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), #7c3aed);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  color: #fff;
}

.user-detail {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
}

.user-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
}

.user-role {
  font-size: 11px;
  color: var(--text-muted);
}

.btn-login {
  padding: 6px 16px;
  border-radius: 6px;
  background: var(--accent);
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  transition: background var(--transition);
}

.btn-login:hover { background: var(--accent-hover); }

.btn-logout {
  padding: 5px 12px;
  border-radius: 6px;
  border: 1px solid var(--border);
  color: var(--text-secondary);
  font-size: 12px;
  transition: all var(--transition);
}

.btn-logout:hover {
  border-color: var(--error);
  color: var(--error);
}

.page-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}
</style>
