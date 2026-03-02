// 独立运行时的入口（开发调试用）
// 当被 Shell 通过 Module Federation 消费时，此文件不会执行，只有 exposes 中的组件会被加载
import { createApp } from 'vue';
import App from './App.vue';

createApp(App).mount('#app');
