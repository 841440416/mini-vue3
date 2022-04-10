import { isObject } from './../../shared/src/index';
import { track, trigger } from "./effect";
import { reactive } from './reactive';

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
    const res = Reflect.get(target, key, receiver);
    if(isObject(res)) {
      return reactive(res); // 深度代理
    }
    return res;
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