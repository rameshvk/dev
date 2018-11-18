'use strict';

import traverseRange from './traverseRange';
import isInlineNode from './isInlineNode';

export default function hasNewlineBetweenNodes(node1, node2, shouldDescend) {
  if (node1 === node2 || !node1 || !node2) return false;
  return traverseRange(node1, node2, check, shouldDescend);

  function check(node) {
    if (!isInlineNode(node)) return true;
  }
}
