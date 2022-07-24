import { getApps } from "../index";
import { importHTML } from "../importHtml/import-html";
import { getNextRoute, getPrevRoute } from "./rewrite-router";

// 处理路由变化
export const handleRouter = async () => {
  const apps = getApps(); // 获取到所有的子应用列表

  // 获取上一个路由应用用于卸载
  const prevApp = apps.find((item) => {
    return getPrevRoute().startsWith(item.activeRule);
  });

  // 获取下一个路由应用 用于加载
  const app = apps.find((item) => {
    return getNextRoute().startsWith(item.activeRule);
  });

  // 如果有上一个应用则销毁
  if (prevApp) {
    await unmount(prevApp);
  }

  // 如果没有app 说明没有获取到，则是在主应用当中跳转
  if (!app) {
    return;
  }

  // 3、加载并解析当前子应用(html-import-entry)
  const { template, getExternalScripts, execScripts } = await importHTML(
    app.entry
  );
  // 获取到子应用渲染的容器
  const container = document.querySelector(app.container);
  container.appendChild(template);

  // 配置全局环境变量
  window.__POWERED_BY_QIANKUN__ = true; // 用于判断是否运行在qiankun环境
  /* 
    将当前子应用的入口地址设为全局，子应用中的webpack通过public-path.js文件中的这个变量动态查找文件图片等资源
  */
  window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__ = app.entry;

  // 获取到当前子应用js 代码执行结果
  const appExports = await execScripts();

  // 将子应用导出的三个方法赋值给当前注册的子应用
  app.bootstrap = appExports.bootstrap;
  app.mount = appExports.mount;
  app.unmount = appExports.unmount;

  // 手动调用子应用的挂载前的钩子函数
  await bootstrap(app);
  // 挂载子应用
  await mount(app);
};

async function bootstrap(app) {
  app.bootstrap && (await app.bootstrap());
}
async function mount(app) {
  app.mount &&
    (await app.mount({
      container: document.querySelector(app.container),
    }));
}
async function unmount(app) {
  app.unmount &&
    (await app.unmount({
      container: document.querySelector(app.container),
    }));
}
