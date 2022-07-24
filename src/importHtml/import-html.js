import { fetchResource } from "../fetch/fetch-resource";

// importHTML方法最终导出getExternalScripts，execScripts， template
export const importHTML = async (url) => {
  const html = await fetchResource(url); // 获取当前激活的子应用html（文本格式的）
  const template = document.createElement("div");
  /* 
    将文本插入到div当中，此时子应用的html文本已经被插入到父应用当中，在浏览器审查元素中能够看到
    注意：html和js代码一并插入其中，浏览器处于安全考虑并不会执行生成的html节点当中的js代码，所以需要手动执行
  */
  template.innerHTML = html;

  // 获取到子应用当中的js代码
  const scirpts = template.querySelectorAll("script");

  // 获取所有的scirpt标签的代码：[代码，代码]
  function getExternalScripts() {
    // 返回解析完成的代码片段
    return Promise.all(
      [...scirpts].map((scirpt) => {
        const src = scirpt.getAttribute("src"); // 获取script的src属性
        if (!src) {
          // 没有src 属性说明是内联的script脚本
          return Promise.resolve(scirpt.innerHTML);
        }
        /* 
          如若是scr外链的js，则继续通过fetch请求内部的资源
          判断子应用的script 的资源是否是以http开头，是http开头就直接请求，不是http开头就拼接url+src
        */
        return fetchResource(src.startsWith("http") ? src : `${url}${src}`);
      })
    );
  }

  // 获取并执行所有的scirpt 脚本代码
  async function execScripts() {
    const scripts = await getExternalScripts(); // 获取解析后的script代码，数组形式
    /* 
      (function webpackUniversalModuleDefinition(root, factory) {
        if(typeof exports === 'object' && typeof module === 'object')
          module.exports = factory();
        else if(typeof define === 'function' && define.amd)
          define([], factory);
        else if(typeof exports === 'object')
          exports["subapp-vue1"] = factory();
        else
          root["subapp-vue1"] = factory();
      })(window, function() {});
    */
    // 手动的构造一个 CommonJS 模块环境
    const module = { exports: {} };
    const exports = module.exports;
    scripts.forEach((code) => {
      // eval 执行js代码
      eval(code);
    });
    console.log(module.exports);
    return module.exports;
    // // 这样需要知道每个子应用暴露到window中的名字，太麻烦
    // return window["subapp-vue1"];
  }

  return {
    template,
    getExternalScripts,
    execScripts,
  };
};
