import { handleRouter } from "./handle-router";

let prevRoute = ""; // 上一个路由
let nextRoute = window.location.pathname; // 下一个路由

export const getPrevRoute = () => prevRoute; // 获取上一个子应用路由
export const getNextRoute = () => nextRoute; // 获取当前子应用路由

// 重写路由的方法
export const rewriteRouter = () => {
  // hash路由   window.onhashchange
  // history路由
  //    history.go、history.back、history.forward 使用 popstate 事件：window.onpopstate
  //    pushState、replaceState 需要通过函数重写的方式进行劫持

  // popState 触发的时候，路由已经完成导航，在这个方法里获取到的路由是跳转之后的路由
  window.addEventListener("popstate", () => {
    // 前进后退的浏览器导航方法，这里使用addEventListener 注册方法是避免覆盖之前的popState方法
    prevRoute = nextRoute; // 将当前路由赋值成上一个路由
    nextRoute = window.location.pathname; // 当前路由取地址栏的路由
    handleRouter();
  });

  // 重写点击菜单跳转的路由方法
  const rawPushState = window.history.pushState;
  window.history.pushState = (...args) => {
    // 导航前保存当前的路由为上一个路由
    prevRoute = window.location.pathname;
    rawPushState.apply(window.history, args); // 这是在真正的改变历史记录
    // 导航后将最新的路由设为当前路由
    nextRoute = window.location.pathname;
    handleRouter();
  };

  // 重写replace 跳转方法
  const rawReplaceState = window.history.replaceState;
  window.history.replaceState = (...args) => {
    // 导航前
    prevRoute = window.location.pathname;
    rawReplaceState.apply(window.history, args);
    // 导航后
    nextRoute = window.location.pathname;
    handleRouter();
  };
};
