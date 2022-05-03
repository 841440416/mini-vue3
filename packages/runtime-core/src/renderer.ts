import { ShapeFlags, isString } from "@vue/shared";
import { creatVnode, isSameVnode, Text } from "./vnode";
export function createRenderer(renderOptions) {
  const {
    insert: hostInsert,
    remove: hostRemove,
    setElementText: hostSetElementText,
    setText: hostSetText,
    parentNode: hostParentNode,
    nextSibling: hostNextSibling,
    createElement: hostCreateElement,
    createText: hostCreateText,
    patchProp: hostPatchProp,
  } = renderOptions;

  const normalize = (child, i) => {
    if (isString(child[i])) {
      const vnode = creatVnode(Text, null, child[i]);
      child[i] = vnode;
    }
    return child[i];
  };

  // 递归渲染children
  const mountChildren = (children, container) => {
    for (let i = 0; i < children.length; i++) {
      let child = normalize(children, i);
      patch(null, child, container);
    }
  };

  // 渲染vnode
  const mountElement = (vnode, container) => {
    const { type, props, children, shapeFlag } = vnode;
    const el = (vnode.el = hostCreateElement(type));
    if (props) {
      for (let key in props) {
        hostPatchProp(el, key, null, props[key]);
      }
    }
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 文本
      hostSetElementText(el, children);
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      // 数组
      mountChildren(children, el);
    }
    hostInsert(el, container);
  };

  // 插入文本
  const processText = (n1, n2, container) => {
    if (n1 === null) {
      hostInsert((n2.el = hostCreateText(n2.children)), container);
    } else {
      // 文本内容变化，复用老节点
      const el = (n2.el = n1.el);
      if (n1.children !== n2.children) {
        hostSetText(el, n2.children); // 更新文本
      }
    }
  };

  // 比对属性
  const patchPros = (oldProps, newProps, el) => {
    for (let key in newProps) {
      // 新的有，新的覆盖即可
      hostPatchProp(el, key, oldProps[key], newProps[key]);
    }
    for (let key in oldProps) {
      // 老的里面新的没有，则删除老的
      if (newProps[key] === null) {
        hostPatchProp(el, key, oldProps[key], null);
      }
    }
  };

  // 卸载儿子
  const unmountChildren = (children) => {
    for (let i = 0; i < children.length; i++) {
      unmount(children[i]);
    }
  };

  // 比对儿子
  const patchChildren = (n1, n2, el) => {
    const c1 = n1 && n1.children;
    const c2 = n2 && n2.children;
    const prevShapeFlag = n1.shapeFlag; // 老的
    const shapeFlag = n2.shapeFlag; // 新的
    // 新的 ｜ 老的 ｜  说明
    // ------------------------------------
    // 文本 ｜ 数组 ｜ (删除老儿子，设置文本内容)
    // ------------------------------------
    // 文本 ｜ 文本 ｜ (更新文本)
    // ------------------------------------
    // 数组 ｜ 数组 ｜ (diff算法)
    // ------------------------------------
    // 数组 ｜ 文本 ｜ (清空文本，进行挂载)
    // ------------------------------------
    // 空   ｜ 数组 ｜ (删除所有儿子)
    // ------------------------------------
    // 空   ｜ 文本 ｜ (清空文本)

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 删除所有子节点
        unmountChildren(c1); // 文本  数组
      }
      if(c1 !== c2) {
        hostSetElementText(el, c2) // 文本  文本
      }
    } else {
      // 新的为数组或空
      if(prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        if(shapeFlag & ShapeFlags.ARRAY_CHILDREN) { // 数组   数组
          // diff 算法
        } else {
          unmountChildren(c1) // 空   数组
        }
      } else {
        if(prevShapeFlag & ShapeFlags.TEXT_CHILDREN) { // 空 文本
          hostSetElementText(el, '')
        }
        if(shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          mountChildren(c2, el) // 数组  文本
        }
      }
    }
  };

  // 比对节点
  const patchElement = (n1, n2) => {
    const el = (n2.el = n1.el);
    const oldProps = n1.props || {};
    const newProps = n2.props || {};
    // 比较属性
    patchPros(oldProps, newProps, el);
    // 比较儿子
    patchChildren(n1, n2, el);
  };

  // 插入元素
  const processElement = (n1, n2, container) => {
    if (n1 === null) {
      mountElement(n2, container);
    } else {
      patchElement(n1, n2);
    }
  };

  // 卸载vnode
  const unmount = (vnode) => {
    hostRemove(vnode.el); // 删除元素
  };

  //! path vnode
  const patch = (n1, n2, container) => {
    if (n1 === n2) return;
    // 判断是否是同一个vnode，不是卸载重新添加
    if (n1 && !isSameVnode(n1, n2)) {
      unmount(n1); // 删除老的
      n1 = null;
    }
    const { type, shapeFlag } = n2;
    switch (type) {
      // n2是文本
      case Text:
        processText(n1, n2, container);
        break;
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container);
        }
    }
  };

  const render = (vnode, container) => {
    if (vnode === null) {
      // 卸载逻辑，卸载可能是元素，组件，文本
      container._vnode && unmount(container._vnode);
    } else {
      // 初始化或更新逻辑
      patch(container._vnode || null, vnode, container);
    }
    container._vnode = vnode;
  };
  return {
    render,
  };
}
