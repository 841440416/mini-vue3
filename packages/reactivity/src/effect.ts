import { ReactiveFlags } from "./baseHandler";

export let activeEffect = undefined;

function cleanupEffect(effect) {
  const { deps } = effect;
  for (let i = 0; i < deps.length; i++) {
    // 解除effect和deps的关联，重新依赖收集
    deps[i].delete(effect);
  }
  deps.length = 0;
}
export class ReactiveEffect {
  public deps = []; // 记录依赖的属性
  public parent = null; // 父节点
  public active = true; // 实例上新增了active属性
  constructor(public fn, public scheduler) {
    // public：用户传递的参数会挂载this this.fn = fn
  }
  run() {
    // 未激活执行执行函数，无需依赖收集
    if (!this.active) {
      return this.fn();
    }
    try {
      this.parent = activeEffect;
      // 激活执行执行函数，依赖收集，将当前的effect和稍后渲染的属性关联
      activeEffect = this;
      // 这里需要在执行用户的函数前，将之前收集的依赖清空
      cleanupEffect(this);
      return this.fn();
    } finally {
      activeEffect = this.parent; // 执行完还原
      this.parent = null;
    }
  }
  stop() {
    if (this.active) {
      this.active = false;
      cleanupEffect(this); // 停止effect收集依赖
    }
  }
}

export function isReactive(value) {
  return !!(value && value[ReactiveFlags.IS_REACTIVE]);
}

export function effect(fn, options: any = {}) {
  // 这里fn可以根据状态变化 重新执行，effect可以嵌套
  const _effect = new ReactiveEffect(fn, options.scheduler);
  _effect.run(); // 默认执行一次

  const runner = _effect.run.bind(_effect);
  runner.effect = _effect; // 将effect挂载到runner上
  return runner;
}

// effect和属性是多对多关系
const targetMap = new WeakMap();
export function track(target, type, key) {
  if (!activeEffect) return;
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }
  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, (dep = new Set()));
  }
  trackEffects(dep);
}

export function trackEffects(dep) {
  if (activeEffect) {
    let shouldTrack = !dep.has(activeEffect);
    if (shouldTrack) {
      dep.add(activeEffect);
      activeEffect.deps.push(dep); // effect反向记录dep，以便清除
    }
  }
}

export function trigger(target, type, key, value, oldValue) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return; // 触发的值不在模板中使用
  let effects = depsMap.get(key); // 找到对应的effect
  // 在执行前先拷贝一份引用
  effects && triggerEffects(effects);
}

export function triggerEffects(effects) {
  effects = new Set(effects);
  effects.forEach((effect) => {
    // 执行effect的时候，需判断是否执行过，如果执行过，则不再执行
    if (effect !== activeEffect) {
      if (effect.scheduler) {
        effect.scheduler(); // 执行调度
      } else {
        effect.run(); // 否则更新视图
      }
    }
  });
}

// effect设计流程
// 1. 创建一个响应式对象 new proxy
// 2. 创建一个effect, 默认数据变化渲染更新，将正在执行的effect作为全局变量，
// 渲染（取值），在get方法中调用tracker方法中进行依赖收集
// 3. weakMap，将effect和属性关联
// 4. 用户修改数据，调用triggr方法，触发effect，effect执行

// 嵌套执行实现：
// 1. 给ReactiveEffect类标记父亲，构造树形结构
