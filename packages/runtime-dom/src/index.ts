import { createRenderer } from "@vue/runtime-core";
import { nodeOps } from "./nodeOps";
import { patchProp } from "./patchProp";

const renderOptions = Object.assign(nodeOps, {patchProp}); // dom属性api

export function render(vnode, container) {
  createRenderer(renderOptions).render(vnode, container);
}

export * from "@vue/runtime-core";


// runtime-dom（快平台运行：vnode）
  // 1.实现了dom节点操作api
  // 2.实现了dom属性操作api
  // 2.负责调用runtime-core的createRender渲染api