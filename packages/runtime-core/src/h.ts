import { isObject, isArray } from "@vue/shared";
import { creatVnode, isVnode } from "./vnode";
/**
 * 自定义渲染函数h
 * @param type
 * @param propsChildren
 * @param children
 */
export function h(type, propsChildren, children) {
  const l = arguments.length;
  // h('div',{style:{color:'red'}})
  // h('div',h('span',{style:{color:'red'}}))
  // h('div',[h('span',{style:{color:'red'}})])
  // h('div', 'hello')
  if (l === 2) {
    if (isObject(propsChildren) && !isArray(propsChildren)) {
      if (isVnode(propsChildren)) {
        // 包装成数组，方便循环创建
        return creatVnode(type, null, [propsChildren]);
      }
      return creatVnode(type, propsChildren); // 属性
    } else {
      return creatVnode(type, null, propsChildren);
    }
  } else {
    if (l > 3) {
      children = Array.from(arguments).slice(2);
    } else if (l === 3 && isVnode(children)) {
      children = [children];
    }
    // children 情况分两种，文本和元素数组
    return creatVnode(type, propsChildren, children);
  }
}
