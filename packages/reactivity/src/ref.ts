import { isArray } from './../../shared/src/index';
import { isObject } from "@vue/shared";
import { trackEffects, triggerEffects } from "./effect";
import { reactive } from "./reactive";

function toReactive(value) {
  return isObject(value) ? reactive(value) : value;
}

/**
 * 1.会将基本数据类型包装成对象
 * 1.如果是对象会转为reactive
 */
class RefImpl {
  public _value;
  public dep = new Set;
  public __v_isRef = true;
  constructor(public rawValue) {
    this._value = toReactive(rawValue);
  }
  // 类中的属性访问器，底层就是Object.definProperty
  get value() {
    trackEffects(this.dep);
    return this._value;
  }
  set value(newValue) {
    if(newValue !== this.rawValue) {
      this._value = toReactive(newValue);
      this.rawValue = newValue;
      triggerEffects(this.dep);
    }
  }
}

export function ref(value) {
  return new RefImpl(value);
}

class ObjectRefImpl {
  constructor(public object, public key) {

  }
  get value() {
    return this.object[this.key];
  }
  set value(newValue) {
    this.object[this.key] = newValue;
  }
}

export function toRef(obj, key) {
  return new ObjectRefImpl(obj, key)
}

export function toRefs(obj) {
  const result = isArray(obj) ? new Array(obj.length) : {};
  for(let key in obj) {
    result[key] = toRef(obj, key);
  }
  return result;
}

export function proxyRefs(obj) {
  return new Proxy(obj, {
    get(target, key, recevier){
      const r = Reflect.get(target, key, recevier);
      return r.__v_isRef ? r.value : r;
    },
    set(target, key, value, receiver) {
      const oldValue = target[key];
      if(oldValue.__v_isRef) {
        oldValue.value = value;
        return true;
      } else {
        return Reflect.set(target, key, value, receiver);
      }
    }
  })
}
