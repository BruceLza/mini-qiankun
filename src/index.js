import { rewriteRouter } from "./dealRouter/rewrite-router";
import { handleRouter } from "./dealRouter/handle-router";

let _apps = [];
export const getApps = () => _apps;

// 导出注册子应用的方法
export const registerMicroApps = (apps) => {
  // console.log(apps);
  _apps = apps;
};
// 导出开始运行子应用的方法
export const start = () => {
  // 微前端的运行原理：
  // 1、监视路由变化
  rewriteRouter();
  // 初始执行匹配
  handleRouter();
};
