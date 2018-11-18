'use strict';

const Direction = {
  Horizontal: ['Horizontal'],
  Vertical: ['Vertical']
};

function isScrollable(node, direction) {
  const field = direction === Horizontal ? 'overflowX' : 'overflowY';
  return window.getComputedStyle(node)[field] !== 'visible';
};

function getScrollContainer(node, root, direction) {
  let parent = node;
  while (parent !== root && parent !== null) {
    if (isScrollable(parent, direction)) return parent;
    parent = parent.parentNode;
  }
  return root;
};

function scrollElementIntoView(node,
