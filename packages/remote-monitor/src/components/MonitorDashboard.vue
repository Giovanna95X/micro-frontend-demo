<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

interface Service {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'error';
  qps: number;
  p99: number;
  errorRate: number;
  instances: number;
  deps: string[];
}

interface Alert {
  id: string;
  level: 'critical' | 'warning' | 'info';
  service: string;
  message: string;
  time: string;
}

const services = ref<Service[]>([
  { id: 'gw',      name: 'API Gateway',     status: 'healthy', qps: 1247, p99: 45,  errorRate: 0.12, instances: 8, deps: [] },
  { id: 'auth',    name: 'Auth Service',     status: 'healthy', qps: 892,  p99: 38,  errorRate: 0.05, instances: 4, deps: ['gw'] },
  { id: 'order',   name: 'Order Service',    status: 'warning', qps: 423,  p99: 182, errorRate: 1.8,  instances: 6, deps: ['gw', 'auth'] },
  { id: 'payment', name: 'Payment Service',  status: 'healthy', qps: 211,  p99: 92,  errorRate: 0.08, instances: 4, deps: ['order'] },
  { id: 'notify',  name: 'Notification',     status: 'error',   qps: 0,    p99: 0,   errorRate: 100,  instances: 0, deps: ['order'] },
  { id: 'config',  name: 'Config Center',    status: 'healthy', qps: 152,  p99: 12,  errorRate: 0,    instances: 3, deps: [] },
]);

const alerts = ref<Alert[]>([
  { id: '1', level: 'critical', service: 'Notification',  message: '所有实例宕机，服务完全不可用',         time: '2分钟前' },
  { id: '2', level: 'warning',  service: 'Order Service', message: 'P99延迟超过阈值 (182ms > 100ms)',     time: '8分钟前' },
  { id: '3', level: 'info',     service: 'API Gateway',   message: 'QPS 峰值告警，当前 1247/s',           time: '15分钟前' },
  { id: '4', level: 'info',     service: 'Auth Service',  message: '实例扩容完成，当前运行 4 个实例',      time: '32分钟前' },
]);

const lastUpdated = ref(new Date().toLocaleTimeString('zh-CN'));
const healthyCount = computed(() => services.value.filter(s => s.status === 'healthy').length);
const warningCount = computed(() => services.value.filter(s => s.status === 'warning').length);
const errorCount   = computed(() => services.value.filter(s => s.status === 'error').length);

// 模拟实时数据更新
let timer: ReturnType<typeof setInterval>;
onMounted(() => {
  timer = setInterval(() => {
    services.value = services.value.map(s => ({
      ...s,
      qps: s.status !== 'error'
        ? Math.max(0, s.qps + Math.round((Math.random() - 0.48) * 30))
        : 0,
      p99: s.status !== 'error'
        ? Math.max(5, s.p99 + Math.round((Math.random() - 0.5) * 8))
        : 0,
    }));
    lastUpdated.value = new Date().toLocaleTimeString('zh-CN');
  }, 2000);
});
onUnmounted(() => clearInterval(timer));

const statusLabel: Record<Service['status'], string> = {
  healthy: '健康', warning: '告警', error: '异常',
};

const levelLabel: Record<Alert['level'], string> = {
  critical: '紧急', warning: '告警', info: '信息',
};

// 拓扑图数据
const topoNodes = [
  { id: 'gw',      x: 50,  y: 60, label: 'API Gateway',    status: 'healthy' as const },
  { id: 'auth',    x: 220, y: 20, label: 'Auth Service',    status: 'healthy' as const },
  { id: 'order',   x: 220, y: 100,label: 'Order Service',   status: 'warning' as const },
  { id: 'payment', x: 390, y: 60, label: 'Payment Service', status: 'healthy' as const },
  { id: 'notify',  x: 390, y: 140,label: 'Notification',    status: 'error' as const   },
  { id: 'config',  x: 50,  y: 160,label: 'Config Center',   status: 'healthy' as const },
];

const topoEdges = [
  { from: 'gw', to: 'auth' },
  { from: 'gw', to: 'order' },
  { from: 'order', to: 'payment' },
  { from: 'order', to: 'notify' },
];

function getNodePos(id: string) {
  return topoNodes.find(n => n.id === id) || { x: 0, y: 0 };
}
</script>

<template>
  <div class="dashboard">
    <!-- 头部 -->
    <div class="dash-header">
      <div>
        <h2 class="dash-title">服务高可用监控面板</h2>
        <p class="dash-sub">实时数据 · 每 2 秒刷新</p>
      </div>
      <div class="header-right">
        <span class="update-time">最后更新: {{ lastUpdated }}</span>
        <div class="summary-pills">
          <span class="pill healthy">健康 {{ healthyCount }}</span>
          <span class="pill warning">告警 {{ warningCount }}</span>
          <span class="pill error">异常 {{ errorCount }}</span>
        </div>
      </div>
    </div>

    <!-- 服务卡片 -->
    <div class="services-grid">
      <div
        v-for="svc in services"
        :key="svc.id"
        class="service-card"
        :class="svc.status"
      >
        <div class="card-header">
          <div class="card-name">{{ svc.name }}</div>
          <div class="status-badge" :class="svc.status">
            <span class="status-dot" :class="svc.status"></span>
            {{ statusLabel[svc.status] }}
          </div>
        </div>
        <div class="metrics">
          <div class="metric">
            <span class="metric-label">QPS</span>
            <span class="metric-value">{{ svc.qps.toLocaleString() }}</span>
          </div>
          <div class="metric">
            <span class="metric-label">P99 延迟</span>
            <span class="metric-value" :class="{ warn: svc.p99 > 100 }">{{ svc.p99 }}ms</span>
          </div>
          <div class="metric">
            <span class="metric-label">错误率</span>
            <span class="metric-value" :class="{ warn: svc.errorRate > 0.5 }">{{ svc.errorRate }}%</span>
          </div>
          <div class="metric">
            <span class="metric-label">实例数</span>
            <span class="metric-value">{{ svc.instances }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 服务拓扑图 -->
    <div class="section">
      <h3 class="section-title">服务依赖拓扑</h3>
      <div class="topology-wrapper">
        <svg class="topology-svg" viewBox="0 0 500 200" preserveAspectRatio="xMidYMid meet">
          <!-- 边 -->
          <g>
            <line
              v-for="(edge, i) in topoEdges"
              :key="i"
              :x1="getNodePos(edge.from).x + 60"
              :y1="getNodePos(edge.from).y + 18"
              :x2="getNodePos(edge.to).x"
              :y2="getNodePos(edge.to).y + 18"
              stroke="#334155"
              stroke-width="1.5"
              stroke-dasharray="4 3"
              marker-end="url(#arrow)"
            />
          </g>
          <!-- 箭头 marker -->
          <defs>
            <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="#475569" />
            </marker>
          </defs>
          <!-- 节点 -->
          <g v-for="node in topoNodes" :key="node.id">
            <rect
              :x="node.x"
              :y="node.y"
              width="120"
              height="36"
              rx="6"
              :fill="node.status === 'healthy' ? '#1a2d1a' : node.status === 'warning' ? '#2d2410' : '#2d1a1a'"
              :stroke="node.status === 'healthy' ? '#22c55e' : node.status === 'warning' ? '#f59e0b' : '#ef4444'"
              stroke-width="1"
            />
            <circle
              :cx="node.x + 12"
              :cy="node.y + 18"
              r="4"
              :fill="node.status === 'healthy' ? '#22c55e' : node.status === 'warning' ? '#f59e0b' : '#ef4444'"
            />
            <text
              :x="node.x + 22"
              :y="node.y + 22"
              font-size="10"
              fill="#f1f5f9"
              font-family="system-ui, sans-serif"
            >{{ node.label }}</text>
          </g>
        </svg>
      </div>
    </div>

    <!-- 告警列表 -->
    <div class="section">
      <h3 class="section-title">近期告警</h3>
      <div class="alerts-list">
        <div
          v-for="alert in alerts"
          :key="alert.id"
          class="alert-item"
          :class="alert.level"
        >
          <div class="alert-level" :class="alert.level">{{ levelLabel[alert.level] }}</div>
          <div class="alert-body">
            <span class="alert-service">{{ alert.service }}</span>
            <span class="alert-msg">{{ alert.message }}</span>
          </div>
          <div class="alert-time">{{ alert.time }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  --c-healthy: #22c55e;
  --c-warning: #f59e0b;
  --c-error: #ef4444;
  color: #f1f5f9;
  font-family: system-ui, -apple-system, 'PingFang SC', sans-serif;
}

/* 头部 */
.dash-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.dash-title {
  font-size: 18px;
  font-weight: 700;
  color: #f1f5f9;
  margin-bottom: 2px;
}

.dash-sub { font-size: 12px; color: #64748b; }

.header-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.update-time { font-size: 11px; color: #64748b; }

.summary-pills {
  display: flex;
  gap: 6px;
}

.pill {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 12px;
}

.pill.healthy { background: rgba(34,197,94,.15); color: #22c55e; }
.pill.warning { background: rgba(245,158,11,.15); color: #f59e0b; }
.pill.error   { background: rgba(239,68,68,.15);  color: #ef4444; }

/* 服务卡片 */
.services-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 24px;
}

.service-card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 10px;
  padding: 14px;
  transition: border-color 0.15s;
}

.service-card.warning { border-color: rgba(245,158,11,.4); }
.service-card.error   { border-color: rgba(239,68,68,.4); }

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.card-name {
  font-size: 13px;
  font-weight: 600;
  color: #f1f5f9;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 10px;
}

.status-badge.healthy { background: rgba(34,197,94,.15); color: #22c55e; }
.status-badge.warning { background: rgba(245,158,11,.15); color: #f59e0b; }
.status-badge.error   { background: rgba(239,68,68,.15);  color: #ef4444; }

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-dot.healthy { background: #22c55e; animation: pulse-dot 2s infinite; }
.status-dot.warning { background: #f59e0b; animation: pulse-dot 1.5s infinite; }
.status-dot.error   { background: #ef4444; animation: pulse-dot 0.8s infinite; }

@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.3); }
}

.metrics {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}

.metric {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.metric-label {
  font-size: 10px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.metric-value {
  font-size: 15px;
  font-weight: 700;
  color: #f1f5f9;
  font-variant-numeric: tabular-nums;
}

.metric-value.warn { color: #f59e0b; }

/* 通用分区 */
.section { margin-bottom: 24px; }

.section-title {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 10px;
}

/* 拓扑图 */
.topology-wrapper {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 10px;
  padding: 16px;
}

.topology-svg {
  width: 100%;
  height: 180px;
  display: block;
}

/* 告警 */
.alerts-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.alert-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  border-left-width: 3px;
}

.alert-item.critical { border-left-color: #ef4444; }
.alert-item.warning  { border-left-color: #f59e0b; }
.alert-item.info     { border-left-color: #3b82f6; }

.alert-level {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  min-width: 36px;
  text-align: center;
  flex-shrink: 0;
}

.alert-level.critical { background: rgba(239,68,68,.2); color: #ef4444; }
.alert-level.warning  { background: rgba(245,158,11,.2); color: #f59e0b; }
.alert-level.info     { background: rgba(59,130,246,.2); color: #3b82f6; }

.alert-body {
  flex: 1;
  display: flex;
  gap: 8px;
  align-items: baseline;
}

.alert-service {
  font-size: 12px;
  font-weight: 600;
  color: #f1f5f9;
  min-width: 120px;
  flex-shrink: 0;
}

.alert-msg {
  font-size: 12px;
  color: #94a3b8;
}

.alert-time {
  font-size: 11px;
  color: #64748b;
  flex-shrink: 0;
}
</style>
