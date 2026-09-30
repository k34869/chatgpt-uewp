export default {
  'run-at': 'document-start',
  match: '*://chatgpt.com/*',
  grant: ['window.onurlchange', 'GM_registerMenuCommand', 'GM_addStyle'],
};
