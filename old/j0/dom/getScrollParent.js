'use strict';

import findAncestor from './findAncestor';

export default function getScrollParent(elt, horizontalOrVertical) {
  const isHorizontal = horizontalOrVertical == 'horizontal';
  const isVertical = horizontalOrVertical == 'vertical';

  if (!isHorizontal && !isVertical) {
    throw new Error('getScrollParent: horizontalOrVertical must be horizonal or vertical');
  }

  return findAncestor(elt, node => {
    const style = window.getComputedStyle(node);
    const overflow = isHorizontal ? style.overflowX : style.overflowY;
    return overflow === 'hidden' || overflow === 'scroll';
  });
}
