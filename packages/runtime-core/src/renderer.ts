import { ShapeFlags, isString } from "@vue/shared";
import { getSequence } from "./sequence";
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
  const mountElement = (vnode, container, anchor) => {
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
    hostInsert(el, container, anchor);
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

  // 卸载儿子
  const unmountChildren = (children) => {
    for (let i = 0; i < children.length; i++) {
      unmount(children[i]);
    }
  };

  // 插入元素
  const processElement = (n1, n2, container, anchor) => {
    if (n1 === null) {
      mountElement(n2, container, anchor);
    } else {
      patchElement(n1, n2);
    }
  };

  // 卸载vnode
  const unmount = (vnode) => {
    hostRemove(vnode.el); // 删除元素
  };

  // 比对属性
  const patchProps = (oldProps, newProps, el) => {
    for (let key in newProps) {
      // 新的有，新的覆盖即可
      hostPatchProp(el, key, oldProps[key], newProps[key]);
    }
    for (let key in oldProps) {
      // 老的里面新的没有，则删除老的
      if (newProps[key] === null) {
        hostPatchProp(el, key, oldProps[key], undefined);
      }
    }
  };

  // 比对节点
  const patchElement = (n1, n2) => {
    const el = (n2.el = n1.el);
    const oldProps = n1.props || {};
    const newProps = n2.props || {};
    // 比较属性
    patchProps(oldProps, newProps, el);
    // 比较儿子
    patchChildren(n1, n2, el);
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
      if (c1 !== c2) {
        hostSetElementText(el, c2); // 文本  文本
      }
    } else {
      // 新的为数组或空
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          // 数组   数组
          // diff 算法
          patchKeyedChildren(c1, c2, el);
        } else {
          unmountChildren(c1); // 空   数组
        }
      } else {
        if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
          // 空 文本
          hostSetElementText(el, "");
        }
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          mountChildren(c2, el); // 数组  文本
        }
      }
    }
  };

  // !🌟 diff算法核心
  const patchKeyedChildren = (c1, c2, el) => {
    let i = 0;
    let e1 = c1.length - 1;
    let e2 = c2.length - 1;
    // sync from start
    while (i <= e1 && i <= e2) {
      const n1 = c1[i];
      const n2 = c2[i];
      if (isSameVnode(n1, n2)) {
        patch(n1, n2, el);
      } else {
        break;
      }
      i++;
    }
    // sync from end
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1];
      const n2 = c2[e2];
      if (isSameVnode(n1, n2)) {
        patch(n1, n2, el);
      } else {
        break;
      }
      e1--;
      e2--;
    }
    // common sequence + mount（i大于e1，小于e2，则是新增的部分）
    if (i > e1) {
      while (i <= e2) {
        const nextpos = e2 + 1;
        const anchor = nextpos < c2.length ? c2[nextpos].el : null;
        patch(null, c2[i], el, anchor); // 创建新节点
        i++;
      }
    } else if (i > e2) {
      // common sequence + unmount（i大于e2，小于e1,则是删除的部分）
      while (i <= e1) {
        unmount(c1[i]);
        i++;
      }
    }
    // unknown sequence
    // a b [c d e] f g
    // a b [e c d h] f g
    // i = 2, e1 = 4, e2 = 5
    const s1 = i;
    const s2 = i;
    const keyToNewIndexMap = new Map();
    for (let i = s2; i <= e2; i++) {
      const nextChild = c2[i];
      keyToNewIndexMap.set(nextChild.key, i);
    }

    // 循环老元素，看下新的里面有没有，有的话需diff,没有则添加到列表中，老的有新的没有需删除
    const toBePatched = e2 - s2 + 1; // 新的总个数
    const newIndexToOldMapIndex = new Array(toBePatched).fill(0); // 记录是否比对过的映射表
    for (let i = s1; i <= e1; i++) {
      const prevChild = c1[i];
      let newIndex = keyToNewIndexMap.get(prevChild.key); // 获取新的索引
      if (newIndex == undefined) {
        unmount(prevChild); // 老的有 新的没有直接删除
      } else {
        newIndexToOldMapIndex[newIndex - s2] = i + 1; // 新的索引对应老的索引，标记patch过的结果
        patch(prevChild, c2[newIndex], el);
      }
    }

    // 移动位置
    const increment = getSequence(newIndexToOldMapIndex) // 获取最长递增子序列
    let j = increment.length - 1;
    for (let i = toBePatched - 1; i >= 0; i--) {
      const nextIndex = s2 + i; // [ecdh]   找到h的索引
      const nextChild = c2[nextIndex]; // 找到 h
      let anchor = nextIndex + 1 < c2.length ? c2[nextIndex + 1].el : null; // 找到当前元素的下一个元素
      if (newIndexToOldMapIndex[i] == 0) {
        // 这是一个新元素 直接创建插入到 当前元素的下一个即可
        patch(null, nextChild, el, anchor);
      } else {
        if(i !== increment[j]) {
          hostInsert(nextChild.el, el, anchor);// 根据参照物 将节点直接移动过去
        } else {
          console.log('跳过不需要移动的元素');
          j--; // 跳过不需要移动的元素， 为了减少移动操作 需要这个最长递增子序列算法 
        }
      }
    }
  };

  //! path vnode
  const patch = (n1, n2, container, anchor = null) => {
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
          processElement(n1, n2, container, anchor);
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
