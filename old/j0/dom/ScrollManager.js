'use strict';

import findAncestor from './findAncestor';
import getContentRect from './getContentRect';
import getCaretAtTextNodePosition from './getCaretAtTextNodePosition';
import getScrollParent from './getScrollParent';
import getTextNodeInfoForPoint from './getTextNodeInfoForPoint';

export default class ScrollManager {
  static scrollTextIntoView(focusId, focusOffset, focusWrapped, direction) {
    if (direction === ScrollManager.HORIZONTAL_AND_VERTICAL) {
      ScrollManager.scrollTextIntoView(focusId, focusOffset, focusWrapped, ScrollManager.HORIZONTAL);
      ScrollManager.scrollTextIntoView(focusId, focusOffset, focusWrapped, ScrollManager.VERTICAL);
      return;
    }

    const elt = document.getElementById(focusId);
    let scrollContainer = null;

    switch (direction) {
    case ScrollManager.HORIZONTAL:
      scrollContainer = getScrollParent(elt, 'horizontal');
      break;
    case ScrollManager.VERTICAL:
      scrollContainer = getScrollParent(elt, 'vertical');
      break;
    default:
      throw new Error('scrollIntoView: direction must be ScrollManager.VERTICAL or ScrollManager.HORIZONTAL');
    }

    if (!elt || !scrollContainer) return;

    const boundingRect = scrollContainer.getBoundingClientRect();
    const contentRect = getContentRect(scrollContainer, boundingRect);
    const focusRect = getCaretAtTextNodePosition(elt.firstChild, focusOffset, focusWrapped);

    // Note that the logic below assumes there is a single scroll container.
    // If this is within another scrollable container, there is no guarantee that this
    // does not scroll that scroll container too which might be required in some cases.
    // TODO: recurse up all scroll parents and move them as needed.
    const grace = 20;
    if (direction === ScrollManager.VERTICAL) {
      if (focusRect.top < contentRect.top) {
        scrollContainer.scrollTop -= contentRect.top - focusRect.top + grace;
      } else if (focusRect.bottom > contentRect.bottom) {
        scrollContainer.scrollTop += focusRect.bottom - contentRect.bottom + grace;
      }
    } else {
      if (focusRect.left < contentRect.left) {
        scrollContainer.scrollLeft -= contentRect.left - focusRect.left + grace;
      } else if (focusRect.right > contentRect.right) {
        scrollContainer.scrollLeft += focusRect.right - contentRect.right + grace;
      }
    }
  }

  static getAttentionInfoForFocus(root, focusId, focusOffset, focusWrapped) {
    const focus = document.getElementById(focusId);
    const focusRect = getCaretAtTextNodePosition(focus.firstChild, focusOffset, focusWrapped);
    const rootRect = getContentRect(root);
    const type = 'focus';
    const left = focusRect.left - rootRect.left;
    const top = focusRect.top - rootRect.top;
    return {type: 'focus', focusId, focusOffset, focusWrapped, left, top};
  }

  static restoreAttention(root, {type, focusId, focusOffset, focusWrapped, left, top}) {
    if (type !== 'focus') return;
    const focus = document.getElementById(focusId);
    if (!focus) return;

    const focusRect = getCaretAtTextNodePosition(focus.firstChild, focusOffset, focusWrapped);
    const rootRect = getContentRect(root);

    const deltaLeft = focusRect.left - rootRect.left - left;
    const deltaTop = focusRect.top - rootRect.top - top;

    if (!deltaLeft && !deltaTop) return;

    let container = getScrollParent(focus, 'horizontal');
    if (container) container.scrollLeft += deltaLeft;
    container = getScrollParent(focus, 'vertical');
    console.log('restoring top', container.scrollTop, deltaTop);
    if (container) container.scrollTop += deltaTop;
  }
}

ScrollManager.HORIZONTAL = ['horizontal'];
ScrollManager.VERTICAL = ['vertical'];
ScrollManager.HORIZONTAL_AND_VERTICAL = ['both'];
ScrollManager.DIRECTION_LEFT = ['left'];
ScrollManager.DIRECTION_RIGHT = ['right'];
ScrollManager.DIRECTION_DOWN = ['down'];
ScrollManager.DIRECTION_UP = ['up'];
