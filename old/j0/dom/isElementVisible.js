'use strict';

function isElementVisibleVertically(containerRect, nodeRect, grace=5) {
  return (containerRect.top < nodeRect.top && nodeRect.top + grace < containerRect.bottom) ||
    (containerRect.top + grace < nodeRect.bottom && nodeRect.bottom < containerRect.bottom);
}
