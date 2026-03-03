<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

interface AuthInfo {
  valid: boolean;
  username?: string;
  role?: string;
  error?: string;
}

const authInfo = ref<AuthInfo | null>(null);

onMounted(async () => {
  try {
    const res = await fetch('http://localhost:3002/__auth', { credentials: 'include' });
    authInfo.value = await res.json();
  } catch {
    authInfo.value = { valid: false, error: 'sso unreachable' };
  }
});

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'developer' | 'viewer';
  status: 'active' | 'inactive';
  joinDate: string;
  avatar: string;
}

const users = ref<User[]>([
  { id: 1,  name: '于思源', email: 'siyuan@company.com',   role: 'admin',     status: 'active',   joinDate: '2021-06', avatar: '于' },
  { id: 2,  name: '李明',   email: 'liming@company.com',   role: 'developer', status: 'active',   joinDate: '2022-03', avatar: '李' },
  { id: 3,  name: '王芳',   email: 'wangfang@company.com', role: 'developer', status: 'active',   joinDate: '2022-07', avatar: '王' },
  { id: 4,  name: '张伟',   email: 'zhangwei@company.com', role: 'viewer',    status: 'inactive', joinDate: '2022-11', avatar: '张' },
  { id: 5,  name: '陈静',   email: 'chenjing@company.com', role: 'developer', status: 'active',   joinDate: '2023-01', avatar: '陈' },
  { id: 6,  name: '刘洋',   email: 'liuyang@company.com',  role: 'admin',     status: 'active',   joinDate: '2021-09', avatar: '刘' },
  { id: 7,  name: '赵磊',   email: 'zhaolei@company.com',  role: 'developer', status: 'active',   joinDate: '2023-04', avatar: '赵' },
  { id: 8,  name: '孙丽',   email: 'sunli@company.com',    role: 'viewer',    status: 'active',   joinDate: '2023-06', avatar: '孙' },
]);

const searchQuery = ref('');
const roleFilter = ref<'all' | User['role']>('all');
const showAddModal = ref(false);
const newUser = ref({ name: '', email: '', role: 'developer' as User['role'] });

const filteredUsers = computed(() => {
  return users.value.filter(u => {
    const matchSearch = !searchQuery.value ||
      u.name.includes(searchQuery.value) ||
      u.email.includes(searchQuery.value);
    const matchRole = roleFilter.value === 'all' || u.role === roleFilter.value;
    return matchSearch && matchRole;
  });
});

const roleLabel: Record<User['role'], string> = {
  admin: '管理员', developer: '开发者', viewer: '观察者',
};

const roleColorClass: Record<User['role'], string> = {
  admin: 'role-admin', developer: 'role-dev', viewer: 'role-viewer',
};

function deleteUser(id: number) {
  users.value = users.value.filter(u => u.id !== id);
}

function addUser() {
  if (!newUser.value.name || !newUser.value.email) return;
  users.value.push({
    id: Date.now(),
    name: newUser.value.name,
    email: newUser.value.email,
    role: newUser.value.role,
    status: 'active',
    joinDate: new Date().toISOString().slice(0, 7),
    avatar: newUser.value.name[0],
  });
  newUser.value = { name: '', email: '', role: 'developer' };
  showAddModal.value = false;
}

const avatarColors = ['#3b82f6', '#a855f7', '#22c55e', '#f59e0b', '#06b6d4', '#ec4899'];
function getAvatarColor(id: number) {
  return avatarColors[id % avatarColors.length];
}
</script>

<template>
  <div class="um">
    <!-- SSO 认证标识 -->
    <div v-if="authInfo" class="sso-bar" :class="authInfo.valid ? 'sso-ok' : 'sso-fail'">
      <span class="sso-bar-dot"></span>
      <template v-if="authInfo.valid">
        Session 验证通过 &nbsp;·&nbsp; 用户：<strong>{{ authInfo.username }}</strong> ({{ authInfo.role }})
        &nbsp;·&nbsp; SESSIONID Cookie → remote-user:3002 → SSO:4000
      </template>
      <template v-else>
        Session 验证失败：{{ authInfo.error }}
      </template>
    </div>

    <!-- 头部 -->
    <div class="um-header">
      <div>
        <h2 class="um-title">用户管理</h2>
        <p class="um-sub">共 {{ users.length }} 名成员 · {{ users.filter(u => u.status === 'active').length }} 活跃</p>
      </div>
      <button class="btn-add" @click="showAddModal = true">+ 添加用户</button>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <div class="search-wrap">
        <span class="search-icon">⌕</span>
        <input
          v-model="searchQuery"
          class="search-input"
          placeholder="搜索姓名或邮箱..."
        />
      </div>
      <div class="role-filters">
        <button
          v-for="opt in [
            { val: 'all', label: '全部' },
            { val: 'admin', label: '管理员' },
            { val: 'developer', label: '开发者' },
            { val: 'viewer', label: '观察者' },
          ]"
          :key="opt.val"
          class="filter-btn"
          :class="{ active: roleFilter === opt.val }"
          @click="roleFilter = opt.val as typeof roleFilter"
        >
          {{ opt.label }}
        </button>
      </div>
    </div>

    <!-- 用户表格 -->
    <div class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th>用户</th>
            <th>邮箱</th>
            <th>角色</th>
            <th>状态</th>
            <th>加入时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="user in filteredUsers"
            :key="user.id"
            class="table-row"
          >
            <td>
              <div class="user-cell">
                <div class="avatar" :style="{ background: getAvatarColor(user.id) }">
                  {{ user.avatar }}
                </div>
                <span class="user-name">{{ user.name }}</span>
              </div>
            </td>
            <td class="cell-email">{{ user.email }}</td>
            <td>
              <span class="role-tag" :class="roleColorClass[user.role]">
                {{ roleLabel[user.role] }}
              </span>
            </td>
            <td>
              <span class="status-tag" :class="user.status">
                <span class="status-dot" :class="user.status"></span>
                {{ user.status === 'active' ? '活跃' : '停用' }}
              </span>
            </td>
            <td class="cell-date">{{ user.joinDate }}</td>
            <td>
              <button
                class="btn-delete"
                @click="deleteUser(user.id)"
                :disabled="user.role === 'admin' && user.id === 1"
                :title="user.role === 'admin' && user.id === 1 ? '不能删除自己' : '删除用户'"
              >删除</button>
            </td>
          </tr>
          <tr v-if="filteredUsers.length === 0">
            <td colspan="6" class="empty-row">未找到匹配用户</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 添加用户弹窗 -->
    <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3>添加新用户</h3>
          <button class="modal-close" @click="showAddModal = false">✕</button>
        </div>
        <div class="modal-body">
          <label class="form-label">姓名</label>
          <input v-model="newUser.name" class="form-input" placeholder="请输入姓名" />
          <label class="form-label">邮箱</label>
          <input v-model="newUser.email" class="form-input" placeholder="请输入邮箱" type="email" />
          <label class="form-label">角色</label>
          <select v-model="newUser.role" class="form-input">
            <option value="developer">开发者</option>
            <option value="admin">管理员</option>
            <option value="viewer">观察者</option>
          </select>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="showAddModal = false">取消</button>
          <button class="btn-confirm" @click="addUser">确认添加</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.um {
  color: #f1f5f9;
  font-family: system-ui, -apple-system, 'PingFang SC', sans-serif;
}

/* 头部 */
.um-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.um-title {
  font-size: 18px;
  font-weight: 700;
  color: #f1f5f9;
  margin-bottom: 2px;
}

.um-sub { font-size: 12px; color: #64748b; }

.btn-add {
  padding: 8px 16px;
  background: #3b82f6;
  color: #fff;
  border-radius: 7px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: background 0.15s;
}

.btn-add:hover { background: #2563eb; }

/* 筛选 */
.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.search-wrap {
  position: relative;
  flex: 1;
  min-width: 200px;
}

.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
  font-size: 16px;
}

.search-input {
  width: 100%;
  padding: 8px 12px 8px 32px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 7px;
  color: #f1f5f9;
  font-size: 13px;
  outline: none;
  transition: border-color 0.15s;
}

.search-input:focus { border-color: #3b82f6; }
.search-input::placeholder { color: #64748b; }

.role-filters {
  display: flex;
  gap: 4px;
}

.filter-btn {
  padding: 7px 14px;
  border-radius: 6px;
  border: 1px solid #334155;
  background: transparent;
  color: #94a3b8;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
}

.filter-btn:hover { background: #253347; color: #f1f5f9; }
.filter-btn.active { background: rgba(59,130,246,.15); border-color: #3b82f6; color: #3b82f6; }

/* 表格 */
.table-wrap {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 10px;
  overflow: hidden;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th {
  padding: 11px 16px;
  text-align: left;
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  background: #253347;
  border-bottom: 1px solid #334155;
}

.table-row {
  border-bottom: 1px solid #334155;
  transition: background 0.1s;
}

.table-row:last-child { border-bottom: none; }
.table-row:hover { background: #253347; }

.table td {
  padding: 12px 16px;
  font-size: 13px;
  color: #f1f5f9;
  vertical-align: middle;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}

.user-name { font-weight: 500; }

.cell-email { color: #94a3b8; font-size: 12px; }
.cell-date  { color: #64748b; font-family: monospace; font-size: 12px; }

.role-tag {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 4px;
}

.role-admin   { background: rgba(59,130,246,.15); color: #3b82f6; }
.role-dev     { background: rgba(34,197,94,.15);  color: #22c55e; }
.role-viewer  { background: rgba(100,116,139,.2); color: #94a3b8; }

.status-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.status-dot.active   { background: #22c55e; animation: blink 2s infinite; }
.status-dot.inactive { background: #475569; }

.status-tag.active   { color: #22c55e; }
.status-tag.inactive { color: #64748b; }

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.btn-delete {
  padding: 4px 10px;
  border-radius: 5px;
  border: 1px solid #334155;
  background: transparent;
  color: #64748b;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-delete:hover:not(:disabled) { border-color: #ef4444; color: #ef4444; }
.btn-delete:disabled { opacity: 0.3; cursor: not-allowed; }

.empty-row {
  text-align: center;
  color: #64748b;
  padding: 32px !important;
}

/* 弹窗 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  backdrop-filter: blur(4px);
}

.modal {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  width: 400px;
  overflow: hidden;
  animation: slideUp 0.2s ease;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #334155;
}

.modal-header h3 {
  font-size: 15px;
  font-weight: 600;
  color: #f1f5f9;
}

.modal-close {
  color: #64748b;
  cursor: pointer;
  font-size: 14px;
  background: none;
  border: none;
  transition: color 0.15s;
}

.modal-close:hover { color: #f1f5f9; }

.modal-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 12px;
  color: #94a3b8;
  font-weight: 500;
}

.form-input {
  padding: 9px 12px;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 6px;
  color: #f1f5f9;
  font-size: 13px;
  outline: none;
  transition: border-color 0.15s;
  width: 100%;
  font-family: inherit;
}

.form-input:focus { border-color: #3b82f6; }

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 14px 20px;
  border-top: 1px solid #334155;
}

.btn-cancel {
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid #334155;
  background: transparent;
  color: #94a3b8;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-cancel:hover { background: #253347; color: #f1f5f9; }

.btn-confirm {
  padding: 8px 16px;
  border-radius: 6px;
  background: #3b82f6;
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: background 0.15s;
}

.btn-confirm:hover { background: #2563eb; }

/* SSO 认证标识条 */
.sso-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 14px;
  border-radius: 6px;
  font-size: 12px;
  margin-bottom: 16px;
}

.sso-bar.sso-ok {
  background: rgba(34, 197, 94, 0.08);
  border: 1px solid rgba(34, 197, 94, 0.25);
  color: #86efac;
}

.sso-bar.sso-fail {
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.25);
  color: #fca5a5;
}

.sso-bar-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
  background: currentColor;
  animation: pulse 2s infinite;
}

.sso-bar strong { color: #fff; font-weight: 600; }
</style>
