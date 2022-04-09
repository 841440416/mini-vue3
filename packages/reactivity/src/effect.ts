export let activeEffect = undefined;
class ReactiveEffect {
  public deps = []; // 记录依赖的属性
  public parent = null; // 父节点
  public active = true; // 实例上新增了active属性
  constructor(public fn) { // public：用户传递的参数会挂载this this.fn = fn
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
      return this.fn();
    } finally {
      activeEffect = this.parent; // 执行完还原
      this.parent = null;
    }
  }
}

export function effect(fn) {
  // 这里fn可以根据状态变化 重新执行，effect可以嵌套
  const _effect = new ReactiveEffect(fn);
  _effect.run(); // 默认执行异常
}

// effect和属性是多对多关系
const targetMap = new WeakMap();
export function track(target, type, key) {
  if(!activeEffect) return;
  let depsMap = targetMap.get(target);
  if(!depsMap) {
    targetMap.set(target, depsMap = new Map());
  }
  let dep = depsMap.get(key);
  if(!dep) {
    depsMap.set(key, dep = new Set());
  }
  let shouldTrack = !dep.has(activeEffect);
  if(shouldTrack) {
    dep.add(activeEffect);
    activeEffect.deps.push(dep); // effect反向记录dep，以便清除
  }
}

export function trigger(target, type, key, value, oldValue) {
  const depsMap = targetMap.get(target);
  if(!depsMap) return; // 触发的值不在模板中使用
  const effects = depsMap.get(key); // 找到对应的effect
  effects && effects.forEach(effect => {
    // 执行effect的时候，需判断是否执行过，如果执行过，则不再执行
    if(effect !== activeEffect) effect.run();
  })
}


// 1. 创建一个响应式对象 new proxy
// 2. 创建一个effect, 默认数据变化渲染更新，将正在执行的effect作为全局变量，
// 渲染（取值），在get方法中调用tracker方法中进行依赖收集
// 3. weakMap，将effect和属性关联
// 4. 用户修改数据，调用triggr方法，触发effect，effect执行




// 嵌套执行实现：
// 1. 给ReactiveEffect类标记父亲，构造树形结构