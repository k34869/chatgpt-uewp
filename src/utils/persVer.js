export function persVer(initialValue, key = "localState") {
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
