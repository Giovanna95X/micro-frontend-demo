import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface User {
  name: string;
  email: string;
  role: string;
  avatar: string;
}

/**
 * SSO 认证 Store
 *
 * 核心思路（对应简历中"解决跨域、SSO等模块加载工程问题"）：
 * 1. Pinia store 作为同页面内所有微模块的共享状态（通过 MF shared 配置共享 pinia 实例）
 * 2. 同时写入 localStorage，实现跨 tab / 独立运行的 remote 应用也能读取认证状态
 * 3. 监听 storage 事件，支持多 tab 登出同步
 */
export const useAuthStore = defineStore('mf-auth', () => {
  const MF_TOKEN_KEY = 'mf_auth_token';
  const MF_USER_KEY = 'mf_auth_user';

  const user = ref<User | null>(
    JSON.parse(localStorage.getItem(MF_USER_KEY) || 'null')
  );
  const token = ref<string | null>(localStorage.getItem(MF_TOKEN_KEY));

  const isLoggedIn = computed(() => !!token.value);

  function login() {
    const mockUser: User = {
      name: '于思源',
      email: 'giovanna.sy.17@gmail.com',
      role: '管理员',
      avatar: '于',
    };
    const mockToken = `mf_token_${Date.now()}`;

    user.value = mockUser;
    token.value = mockToken;

    // 写入 localStorage，让独立运行的 Remote 也能读取
    localStorage.setItem(MF_TOKEN_KEY, mockToken);
    localStorage.setItem(MF_USER_KEY, JSON.stringify(mockUser));
  }

  function logout() {
    user.value = null;
    token.value = null;
    localStorage.removeItem(MF_TOKEN_KEY);
    localStorage.removeItem(MF_USER_KEY);
  }

  // 监听跨 tab 登出
  window.addEventListener('storage', (e) => {
    if (e.key === MF_TOKEN_KEY && !e.newValue) {
      user.value = null;
      token.value = null;
    }
  });

  return { user, token, isLoggedIn, login, logout };
});
