import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface User {
  name: string;
  role: string;
}

/**
 * SSO 认证 Store（工程化版）
 *
 * 登录流程由服务端 CAS 中间件完成，前端只负责：
 *   1. 应用初始化时调用 checkSession() 从服务端获取当前用户信息
 *   2. 登出时调用 logout() 通知服务端删除 Session
 *
 * SESSIONID Cookie 由服务端 httpOnly 设置，前端 JS 无法直接读取（安全规范）。
 * 不再使用 localStorage 模拟，符合实际工程中 SSO 的实现方式。
 */
export const useAuthStore = defineStore('mf-auth', () => {
  const user = ref<User | null>(null);
  const isLoggedIn = computed(() => !!user.value);

  // 从服务端拉取当前 Session 信息（应用启动时调用一次）
  async function checkSession() {
    try {
      const res = await fetch('/__session');
      if (res.ok) {
        const data = await res.json();
        user.value = { name: data.username, role: data.role };
      } else {
        user.value = null;
      }
    } catch {
      user.value = null;
    }
  }

  // 登出：导航至 /__sso-logout，由服务端完成 Session 删除 + Cookie 清除 + 重定向 SSO
  // 全程服务端处理，避免前端 fetch + window.location 的时序竞争问题
  function logout() {
    user.value = null;
    window.location.href = '/__sso-logout';
  }

  return { user, isLoggedIn, checkSession, logout };
});
