'use strict';

import findAncestor from './findAncestor';
import getTextPositionForPoint from './getTextPositionForPoint';
import getNearestRectForPoint from '../shape/rect/getNearestRectForPoint';

export default function getTextNodeInfoForPoint(root, point, textSelector) {
  const textNodes = Array.prototype.slice.call(root.querySelectorAll(textSelector));
  let element = null;

  // lets be optimistic that the point refers to a text node and see if that works
  element = document.elementFromPoint(point.x, point.y);
  if (!element || textNodes.indexOf(element) === -1) {
    // try the long route
    // TODO: this is fairly expensive. some perf optimizations are possible.
    const clientRects = textNodes.map(node => Array.prototype.slice.call(node.getClientRects()));
    const candidates = Array.prototype.concat.apply([], clientRects);
    const nearest = getNearestRectForPoint(candidates, point);
    let index = -1;
    clientRects.forEach((rects, ii) => {
      if (rects.indexOf(nearest) != -1) index = ii;
    });
    element = textNodes[index];
  }

  const info = getTextPositionForPoint(element.firstChild, point);
  if (info) {
    return {focusNode: element, focusId: element.id, focusOffset: info.index, focusWrapped: info.isWrapped};
  }
  return null;
}
