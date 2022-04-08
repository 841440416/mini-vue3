export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive'
}
export const mutableHandlers = {
  get(target, key, receiver) {
    if(key ==  ReactiveFlags.IS_REACTIVE) {
      return true;
    }
    // reflect会将原对象target改成代理对象
    return Reflect.get(target, key, receiver);
  },
  set(target, key, value, receiver) {
    return Reflect.set(target, key, value, receiver);
  }
}