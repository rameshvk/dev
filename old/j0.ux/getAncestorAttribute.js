'use strict';

export default function getAncestorAttribute(target, attribute, root) {
  root = root || null;
  let node = target;
  while (node !== root && node !== null) {
    if (node.hasAttribute(attribute)) return node;
    node = node.parentNode;
  }
  return null;
};
