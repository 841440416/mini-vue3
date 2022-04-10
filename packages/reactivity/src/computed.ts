import { ReactiveEffect, trackEffects, triggerEffects } from "./effect";
import { noop } from "./../../shared/src/index";
import { isFunction } from "@vue/shared";

/**
 * 原理：effect + 缓存 + 收集
 */
class ComputedRefImpl {
  public effect;
  public _dirty = true; // 默认计算属性是脏的
  public __v_isRef = true;
  public __v_isReadonly = true;
  public _value;
  public dep = new Set();
  constructor(getter, public setter) {
    // 将用户的getter放入effect中，依赖就会被收集到这个effect中
    this.effect = new ReactiveEffect(getter, () => {
      // 稍后依赖属性的变化会执行这个函数
      if (!this._dirty) {
        this._dirty = true;
        // 触发更新
        triggerEffects(this.dep);
      }
    });
  }
  // 类中的属性访问器，底层就是Object.definProperty
  get value() {
    // 依赖收集
    trackEffects(this.dep);
    if (this._dirty) {
      this._dirty = false;
      this._value = this.effect.run();
    }
    return this._value;
  }
  set value(newVal) {
    this.setter(newVal);
  }
}

export const computed = (getterOrOptions) => {
  const onlyGetter = isFunction(getterOrOptions);
  let getter;
  let setter;
  if (onlyGetter) {
    getter = getterOrOptions;
    setter = noop(console.warn("setter is not defined"));
  } else {
    getter = getterOrOptions.get;
    setter = getterOrOptions.set;
  }

  return new ComputedRefImpl(getter, setter);
};
