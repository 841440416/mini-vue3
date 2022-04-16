import { ShapeFlags, isString } from "@vue/shared";
import { creatVnode, Text } from "./vnode";
export function createRenderer(renderOptions) {
  const {
    insert: hostInsert,
    remove: hostRemove,
    setElementText: hostSetElementTxt,
    setText: hostSetText,
    parentNode: hostParentNode,
    nextSibling: hostNextSibling,
    createElement: hostCreateElement,
    createText: hostCreateText,
    patchProp: hostPatchProp,
  } = renderOptions;

  const normalize = (child) => {
    if(isString(child)) {
      return creatVnode(Text, null, child);
    }
    return child;
  }

  const mountChildren = (children, container) => {
    for (let i = 0; i < children.length; i++) {
      let child = normalize(children[i])
      patch(null, child, container);
    }
  };

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
      hostSetElementTxt(el, children);
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      // 数组
      mountChildren(children, el);
    }
    hostInsert(el, container);
  };

  const processText = (n1, n2, container) => {
    if (n1 === null) {
      hostInsert((n2.el = hostCreateText(n2.children)), container);
    }
  };

  const patch = (n1, n2, container) => {
    if (n1 === n2) return;
    const { type, shapeFlag } = n2;
    if (n1 === null) {
      // 初次渲染
      switch (type) {
        // n2是文本
        case Text:
          processText(n1, n2, container);
          break;
        default:
          if (shapeFlag & ShapeFlags.ELEMENT) mountElement(n2, container);
      }
    } else {
      // 更新
    }
  };

  const unmount = (vnode) => { 
    hostRemove(vnode.el); // 删除元素
  }

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
