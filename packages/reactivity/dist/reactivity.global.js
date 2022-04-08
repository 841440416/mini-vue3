var VueReactivity = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // packages/reactivity/src/index.ts
  var src_exports = {};
  __export(src_exports, {
    effect: () => effect,
    reactivity: () => reactivity
  });

  // packages/reactivity/src/baseHandler.ts
  var mutableHandlers = {
    get(target, key, receiver) {
      if (key == "__v_isReactive" /* IS_REACTIVE */) {
        return true;
      }
      return Reflect.get(target, key, receiver);
    },
    set(target, key, value, receiver) {
      return Reflect.set(target, key, value, receiver);
    }
  };

  // packages/shared/src/index.ts
  var isObject = (value) => {
    return typeof value === "object" && value !== null;
  };

  // packages/reactivity/src/reactivity.ts
  var reactivityMap = /* @__PURE__ */ new WeakMap();
  function reactivity(target) {
    if (!isObject(target)) {
      return;
    }
    if (target["__v_isReactive" /* IS_REACTIVE */]) {
      return target;
    }
    const existingProxy = reactivityMap.get(target);
    if (existingProxy) {
      return existingProxy;
    }
    const proxy = new Proxy(target, mutableHandlers);
    reactivityMap.set(target, proxy);
    return proxy;
  }

  // packages/reactivity/src/effect.ts
  var activeEffect = void 0;
  var ReactiveEffect = class {
    constructor(fn) {
      this.fn = fn;
      this.active = true;
    }
    run() {
      if (!this.active) {
        this.fn();
        return;
      }
      try {
        activeEffect = this;
        return this.fn();
      } finally {
        activeEffect = void 0;
      }
    }
  };
  function effect(fn) {
    const _effect = new ReactiveEffect(fn);
    _effect.run();
  }
  return __toCommonJS(src_exports);
})();
//# sourceMappingURL=reactivity.global.js.map
