/**
 * 远程模块类型声明
 * 让 TypeScript 知道这些动态 import 路径是合法的
 */
declare module 'remoteMonitor/MonitorDashboard' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<Record<string, never>, Record<string, never>, unknown>;
  export default component;
}

declare module 'remoteUser/UserManagement' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<Record<string, never>, Record<string, never>, unknown>;
  export default component;
}
