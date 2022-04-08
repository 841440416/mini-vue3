import { mutableHandlers, ReactiveFlags } from './baseHandler';
import { isObject } from "./../../shared/src/index";
const reactivityMap = new WeakMap();

/**
 * 1.实现同一个对象代理多次，返回同一个代理
 * 2.代理对象再次被代理可直接返回
 * @param target 
 * @returns proxy
 */
export function reactivity(target) {
  if (!isObject(target)) {
    return;
  }
  // check该代理对象是否被代理过，如果访问这个proxy有get方法说明被访问过了
  if(target[ReactiveFlags.IS_REACTIVE]) {
    return target
  }
  // check该对象是否被代理过,返回该对象的代理对象
  const existingProxy = reactivityMap.get(target);
  if (existingProxy) {
    return existingProxy;
  }
  // 并没有重新定义属性，只是代理，在取值的时候会调用get，设置值的时候会调用set
  const proxy = new Proxy(target, mutableHandlers);
  // 缓存代理对象
  reactivityMap.set(target, proxy);
  return proxy;
}
