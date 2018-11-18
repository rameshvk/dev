'use strict';

function isVisibleVertically(containerRect, {top, bottom}, grace=5) {
  const limitTop = containerRect.top, limitBottom = containerRect.bottom;
  return (limitTop < top && top + grace < limitBottom) ||
    (limitTop + grace < bottom && bottom < limitBottom);
}

function isVisibleHorizontally(containerRect, {left, right}, grace=5) {
  const limitLeft = containerRect.left, limitRight = containerRect.right;
  return (limitLeft < left && left + grace < limitRight) ||
    (limitLeft + grace < right && right < limitRight);
}

export {isVisibleVertically as Vertically, isVisibleHorizontally as Horizontally};
