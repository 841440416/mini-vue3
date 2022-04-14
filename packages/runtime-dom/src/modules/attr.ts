/**
 * 比对属性
 * @param el 
 * @param key 
 * @param nextValue 
 */
export function patchAttr(el, key, nextValue) {
  if (nextValue) {
    el.setAttribute(key, nextValue);
  } else {
    el.removeAttribute(key);
  }
}
