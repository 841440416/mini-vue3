export const isObject = (value) => typeof value === "object" && value !== null;

export const isFunction = (value) => typeof value === "function";

export const isString = (value) => typeof value === "string";

export const isNumber = (value) => typeof value === "number";

export const isArray = (value) => Array.isArray(value);

export const noop = (cb) => {cb && cb();};
