export function createRenderer(renderOptions) {
  const { patchProp, createElement } = renderOptions;
  function render(vnode, container) {
    patchProp(container, null, null, vnode);
  };
  return {
    render
  }
}
