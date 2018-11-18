'use strict';

function shallowEqualDictionary(before, after) {
  for (const key in before) if (before.hasOwnProperty(key) && before[key] !== after[key]) {
    return false;
  }
  for (const key in after) if (after.hasOwnProperty(key) !== before.hasOwnProperty(key)) {
    return false;
  }
  return true;
}

export default function shallowCompare(oldProps, newProps, oldState, newState) {
  return shallowEqualDictionary(oldProps, newProps) && shallowEqualDictionary(oldState, newState);
};
