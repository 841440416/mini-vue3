import { isFunction } from "./../../shared/src/index";
import { isObject } from "@vue/shared";
import { isReactive, ReactiveEffect } from "./effect";

/**
 * watch本质是effect，内部保存老值和新值
 * @param source 用户传入对象或函数
 * @param cb 用户回调
 */
export function watch(source, cb) {
  let getter;
  let oldValue;
  if (isReactive(source)) {
    // 对用户传入的数据进行递归循环，访问对象中每一个属性
    getter = () => traveral(source);
  } else if (isFunction(source)) {
    getter = source;
  }
  let cleanup;
  const onCleanup = (fn) => {
    cleanup = fn; // 保存用户传入的函数
  }
  const job = () => {
    if(cleanup) cleanup(); // 下一次watch开始触发上一次watch的清理
    const newValue = effect.run();
    cb(newValue, oldValue, onCleanup);
    oldValue = newValue;
  };
  const effect = new ReactiveEffect(getter, job); //监控自己构造的数据，变化后重新执行job
  oldValue = effect.run();
}

function traveral(value, set = new Set()) {
  // set处理循环引用问题
  if (!isObject(value)) return value;
  if (set.has(value)) return value;
  set.add(value);
  for (let key in value) {
    traveral(value[key]);
  }
  return value;
}
