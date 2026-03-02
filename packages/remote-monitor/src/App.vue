<script setup lang="ts">
import MonitorDashboard from './components/MonitorDashboard.vue';
</script>

<template>
  <div style="background:#0f172a; min-height:100vh; padding:24px; font-family:system-ui,sans-serif;">
    <div style="color:#94a3b8; font-size:12px; margin-bottom:16px; background:#1e293b; border:1px solid #334155; padding:4px 12px; border-radius:20px; display:inline-flex; align-items:center; gap:6px;">
      <span style="width:6px;height:6px;border-radius:50%;background:#22c55e;display:inline-block;"></span>
      独立运行模式（remote-monitor · Port 3001）
    </div>
    <MonitorDashboard />
  </div>
</template>
