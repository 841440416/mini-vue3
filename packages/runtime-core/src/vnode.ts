import { isString, isArray, ShapeFlags } from "@vue/shared";
export const Text = Symbol("Text");
export function isVnode(value) {
  return !!(value && value.__v_isVNode);
}

/**
 * 创建vnode,虚拟节点有很多：组件、文本、元素
 * @param type
 * @param props
 * @param children
 * @returns
 */
export function creatVnode(type, props, children?) {
  const shapeFlag = isString(type) ? ShapeFlags.ELEMENT : 0;
  const vnode = {
    type,
    props,
    children,
    el: null, // 虚拟节点对应的真实节点，后续diff时会用到
    key: props?.key,
    __v_isVNode: true,
    shapeFlag,
  };
  if (children) {
    let type = 0;
    if (isArray(children)) {
      type = ShapeFlags.ARRAY_CHILDREN;
    } else {
      children = String(children);
      type = ShapeFlags.TEXT_CHILDREN;
    }
    vnode.shapeFlag |= type;
  }
  return vnode;
}
