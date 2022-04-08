export let activeEffect = undefined;
class ReactiveEffect {
  public active = true; // 实例上新增了active属性
  constructor(public fn) { // public：用户传递的参数会挂载this this.fn = fn
  }
  run() {
    // 未激活执行执行函数，无需依赖收集
    if (!this.active) {
      this.fn();
      return;
    }
    try {
      // 激活执行执行函数，依赖收集，将当前的effect和稍后渲染的属性关联
      activeEffect = this;
      return this.fn();
    } finally {
      activeEffect = undefined;
    }
  }
}

export function effect(fn) {
  // 这里fn可以根据状态变化 重新执行，effect可以嵌套
  const _effect = new ReactiveEffect(fn);
  _effect.run(); // 默认执行异常
}
