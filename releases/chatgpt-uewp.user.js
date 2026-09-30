// ==UserScript==
// @name	chatgpt-uewp
// @version	0.0.1
// @description	ChatGPT 优化增强
// @license	MIT
// @run-at	document-start
// @match	*://chatgpt.com/*
// @grant	window.onurlchange
// @grant	GM_registerMenuCommand
// @grant	GM_addStyle
// @author	k34869
// ==/UserScript==

(function () {
  'use strict';

  let prevTitle;

  function getPageTitle(timeout = 9999) {
    return new Promise((resolve, reject) => {
      try {
        let timeBrack, timer;
        timer = setInterval(() => {
          const currentTitle = document.title;
          if (currentTitle !== prevTitle && currentTitle !== 'ChatGPT') {
            clearInterval(timer);
            clearTimeout(timeBrack);
            prevTitle = currentTitle;
            resolve(currentTitle);
          }
        }, 50);
        timeBrack = setTimeout(() => {
          clearInterval(timer);
          clearTimeout(timeBrack);
          reject('timeout');
        }, timeout);
      } catch (err) {
        reject(err.message);
      }
    });
  }

  function persVer(initialValue, key = "localState") {
    // 1️⃣ 初始化：优先从 localStorage 读取
    const saved = localStorage.getItem(key);
    let state = saved ? JSON.parse(saved) : initialValue;

    // 2️⃣ 持久化函数
    const persist = () => {
      localStorage.setItem(key, JSON.stringify(state));
    };

    // 3️⃣ 深度代理（核心）
    const deepProxy = (target) => {
      if (typeof target !== "object" || target === null) return target;

      return new Proxy(target, {
        get(obj, prop) {
          const value = obj[prop];
          // 递归代理，保证深层对象也能监听
          return deepProxy(value);
        },

        set(obj, prop, value) {
          obj[prop] = value;
          persist(); // 每次修改自动存储
          return true;
        },

        deleteProperty(obj, prop) {
          delete obj[prop];
          persist();
          return true;
        },
      });
    };

    // 4️⃣ 对外暴露一个 value 属性（模仿 Vue ref）
    const wrapper = {
      get value() {
        return deepProxy(state);
      },
      set value(v) {
        state = v;
        persist();
      },
    };

    return wrapper;
  }

  var css = ".contents h1 {\r\n  color: #729a32;\r\n}\r\n\r\n.contents h2,\r\n.contents h3,\r\n.contents h4 {\r\n  color: #729a32;\r\n}\r\n\r\n.contents strong {\r\n  color: #eeb651;\r\n  padding: 0 8px;\r\n  border-radius: 5px;\r\n}\r\n\r\n.contents blockquote::after {\r\n  background-color: #eeb651;\r\n}\r\n";

  let menuId;
  const isRestorePage = persVer(true, 'isRestorePage');
  const isRestorePageHandler = () => {
    isRestorePage.value = !isRestorePage.value;
    GM_registerMenuCommand(
      `从首页自动恢复上一次访问页面( ${isRestorePage.value} )`,
      isRestorePageHandler,
      {
        id: menuId,
        autoClose: false,
      },
    );
  };

  menuId = GM_registerMenuCommand(
    `从首页自动恢复上一次访问页面( ${isRestorePage.value} )`,
    isRestorePageHandler,
    {
      autoClose: false,
    },
  );

  if (isRestorePage.value) {
    const prevPage = persVer(
      {
        url: null,
        title: null,
      },
      'prevPage',
    );

    if (location.pathname === '/') {
      if (prevPage.value.url) {
        if (confirm(`是否恢复 '${prevPage.value.title}' 页面`)) {
          location.href = prevPage.value.url;
          throw new Error('switch page');
        }
      }
    }

    getPageTitle();

    window.onurlchange = ({ url }) => {
      getPageTitle().then(title => {
        prevPage.value.url = url;
        prevPage.value.title = title;
      });
    };
  }

  GM_addStyle(css);

})();
