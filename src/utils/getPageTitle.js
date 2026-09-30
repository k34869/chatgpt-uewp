let prevTitle;

export function getPageTitle(timeout = 9999) {
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
