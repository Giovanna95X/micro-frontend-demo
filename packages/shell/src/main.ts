/**
 * Module Federation Bootstrap 模式
 *
 * 不能在这里直接 import Vue/Pinia 等，否则 webpack 会报：
 * "Uncaught Error: Shared module is not available for eager consumption"
 *
 * 原因：shared 模块是异步加载的，但 entry chunk 是同步执行的。
 * 解决方案：用动态 import 让整个应用异步启动，给 MF 时间完成共享模块协商。
 */
import('./bootstrap');
