/**
 * 比对style
 * @param el 
 * @param preValue {color: 'red', fontSize: '12px'}
 * @param nextValue {color: 'blue', background: 'red'}
 */
export function patchStyle(el, preValue, nextValue) {
  // 比对样式差异
  for(let key in nextValue) {
    // 用新值覆盖旧值
    el.style[key] = nextValue[key]
  }
  if(preValue) {
    for(let key in preValue) {
      // 删除不存在的老值
      if(nextValue[key] === null) {
        el.style[key] = null
      }
    }
  }
}
