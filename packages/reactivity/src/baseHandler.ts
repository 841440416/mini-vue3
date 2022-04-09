import { track, trigger } from "./effect";

export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive'
}
export const mutableHandlers = {
  get(target, key, receiver) {
    if(key ==  ReactiveFlags.IS_REACTIVE) {
      return true;
    }
    // 依赖收集
    track(target, 'get', key);
    // reflect会将原对象target改成代理对象
    return Reflect.get(target, key, receiver);
  },
  set(target, key, value, receiver) {
    const oldValue = target[key];
    const result = Reflect.set(target, key, value, receiver);
    if(oldValue !== value) {
      // 更新
      trigger(target, 'set', key, value, oldValue);
    }
    return result;
  }
}