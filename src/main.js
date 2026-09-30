import { getPageTitle } from './utils/getPageTitle';
import { persVer } from './utils/persVer';
import css from './assets/page.css?raw';

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
