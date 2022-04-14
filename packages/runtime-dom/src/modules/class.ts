/**
 * 比对类名
 * @param el 
 * @param nextValue 
 */
export function patchClass(el, nextValue) {
  if(nextValue === null) {
    el.removeAttribute('class')
  } else {
    el.className = nextValue
  }
}