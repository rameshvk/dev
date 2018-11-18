'use strict';

export default function getCommonAncestor(node1, node2) {
  const rr = document.createRange();
  rr.setStart(node1, 0);
  rr.setEnd(node2, 0);
  return rr.commonAncestorContainer;
}
