'use strict';

import {isNodeBeforeOther} from './minmax';

const MaxNodeTraversalCount = 100;
function traverse(before, after, check, shouldDescend, maxNodes) {
  let count = maxNodes || MaxNodeTraversalCount;
  let node = before;
  let level = 0, maxSeenLevel = 0, lastNode = null;

  let result = check(node);
  if (typeof result !== 'undefined') return result;

  if (node.contains(after)) return;

  while (node !== after && count-- > 0) {
    const canDescend = node.firstElementChild && lastNode && lastNode.parentNode !== node;
    lastNode = node;
    if (canDescend && shouldDescend(node)) {
      node = node.firstElementChild;
      level --;
    } else if (!node.contains(after) && node.nextElementSibling) {
      node = node.nextElementSibling;
    } else {
      node = node.parentNode;
      level ++;
      if (level > maxSeenLevel) {
        maxSeenLevel ++;
      } else {
        // already visited this level, do not do double check
        continue;
      }
    }
    result = check(node);
    if (typeof result !== 'undefined') return result;
  }

  if (count <= 0) {
    throw new Error('Traversal simply did not terminate');
  }
}


export default function traverseRange(node1, node2, check, shouldDescend) {
  if (node1 === node2) return check(node1);
  const before = isNodeBeforeOther(node1, node2) ? node1 : node2;
  const after = (before === node1) ? node2 : node1;

  return traverse(before, after, check, shouldDescend);
}
