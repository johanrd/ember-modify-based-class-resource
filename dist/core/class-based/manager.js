import { createCache, getValue } from '@glimmer/tracking/primitives/cache';
import { associateDestroyableChild } from '@ember/destroyable';
import { setHelperManager, capabilities } from '@ember/helper';
import { Resource } from './resource.js';

function _typeof(o) {
  "@babel/helpers - typeof";

  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
    return typeof o;
  } : function (o) {
    return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
  }, _typeof(o);
}

function _toPrimitive(input, hint) {
  if (_typeof(input) !== "object" || input === null) return input;
  var prim = input[Symbol.toPrimitive];
  if (prim !== undefined) {
    var res = prim.call(input, hint || "default");
    if (_typeof(res) !== "object") return res;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (hint === "string" ? String : Number)(input);
}

function _toPropertyKey(arg) {
  var key = _toPrimitive(arg, "string");
  return _typeof(key) === "symbol" ? key : String(key);
}

function _defineProperty(obj, key, value) {
  key = _toPropertyKey(key);
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}

class ResourceManager {
  constructor(owner) {
    _defineProperty(this, "capabilities", capabilities('3.23', {
      hasValue: true,
      hasDestroyable: true
    }));
    this.owner = owner;
  }
  createHelper(Class, args) {
    let owner = this.owner;
    let instance;
    let cache = createCache(() => {
      if (instance === undefined) {
        instance = new Class(owner);
        associateDestroyableChild(cache, instance);
      }
      if (instance.modify) {
        instance.modify(args.positional, args.named);
      }
      return instance;
    });
    return cache;
  }
  getValue(cache) {
    let instance = getValue(cache);
    return instance;
  }
  getDestroyable(cache) {
    return cache;
  }
}
setHelperManager(owner => new ResourceManager(owner), Resource);
//# sourceMappingURL=manager.js.map
