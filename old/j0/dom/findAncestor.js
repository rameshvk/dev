'use strict';

export default function findAncestor(elt, predicate) {
  let parent = elt && elt.parentNode;
  while (parent && !predicate(parent)) {
    parent = parent.parentNode;
  }
  return parent;
}
