/**
 * 比对事件
 * 第一次绑定了onClick事件“a“ , null => a
 * 第一次绑定了onClick事件“b“, a => b
 * 第一次绑定了onClick事件 null， b => null
 * @param el 
 * @param eventName 
 * @param nextValue 
 */
export function patchEvent(el, eventName, nextValue) {
  // remove + add => add + 自定义事件
  let invokers = el._vei || (el._vei = {});
  let exits = invokers[eventName]; // 是否绑定过
  if(exits && nextValue) {
    // 已经绑定过，更新
    exits.value = nextValue;
  }else {
    let event = eventName.slice(2).toLowerCase(); // onClick => click
    if(nextValue) {
      const invoker = invokers[eventName] = createInvoker(nextValue);
      el.addEventListener(event, invoker);
    }else if(exits) { // 移除老的事件
      el.removeEventListener(event, exits)
      invokers[eventName] = undefined
    }
  }
}

function createInvoker(cb) {
  const invoker = (e) => invoker.value(e);
  invoker.value = cb;
  return invoker;
}