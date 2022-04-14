import { patchAttr } from "./modules/attr";
import { patchClass } from "./modules/class";
import { patchEvent } from "./modules/event";
import { patchStyle } from "./modules/style";

export function patchProp(el, key, preVal, nextVal) {
    // 类名 el.className
  if (key === "class") {
    patchClass(el, nextVal);
  } else if (key === "style") {
    // 样式 el.style
    patchStyle(el, preVal, nextVal);
  } else if (/^on[^a-z]/.test(key)) {
    // events
    patchEvent(el, key, nextVal);
  } else {
    // 普通属性
    patchAttr(el, key, nextVal);
  }
}
