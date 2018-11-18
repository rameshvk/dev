'use strict';

export function isNodeBeforeOther(node, other) {
  return !!(node.compareDocumentPosition(other) & node.DOCUMENT_POSITION_FOLLOWING);
}

export function isNodeAfterOther(node, other) { return isNodeBeforeOther(other, node); }

function find(minOrMax, focusId, focusOffset, var_args) {
  const matches = minOrMax === Math.min ? isNodeAfterOther : isNodeBeforeOther;
  let id = focusId, offset = focusOffset, node = null;
  for (let ii = 3; ii < arguments.length; ii += 2) {
    const otherId = arguments[ii], otherOffset = arguments[ii + 1] || 0;
    if (otherId === id) offset = minOrMax(offset, otherOffset);
    else {
      const otherNode = document.getElementById(otherId);
      node = node || document.getElementById(id);
      if (node && otherNode && matches(node, otherNode)) {
        id = otherId;
        node = otherNode;
        offset = otherOffset;
      }
    }
  }

  return {node, id, offset};
}

export function min(focusId, focusOffset, var_args) {
  return find.apply(null, [Math.min].concat(Array.prototype.slice.call(arguments)));
}

export function max(focusId, focusOffset, var_args) {
  return find.apply(null, [Math.max].concat(Array.prototype.slice.call(arguments)));
}
