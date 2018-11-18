'use strict';

import getNearestRectForPoint from '../shape/rect/getNearestRectForPoint.js';
import isRectWithinRect from '../shape/rect/isRectWithinRect.js';
import getCaretAtTextNodePosition from './getCaretAtTextNodePosition.js';
import binarySearch from '../search/binary.js';

function isCaretWithinRect(caret, rect) {
  return caret.left >= rect.left && caret.right <= rect.right &&
    ((caret.top <= rect.top && caret.bottom >= rect.bottom) ||
     (caret.top >= rect.top && caret.bottom <= rect.bottom));
}

function getSomeIndexWithinRect(textNode, rect) {
  const text = textNode.nodeValue;
  const len = text.length;
  return binarySearch(0, len, ii => {
    // TODO: use intersects
    const caretRect = getCaretAtTextNodePosition(textNode, ii, false);
    const altCaretRect = getCaretAtTextNodePosition(textNode, ii, true);

    if (isCaretWithinRect(caretRect, rect) || isCaretWithinRect(altCaretRect, rect)) {
      return 0;
    }
    const {top, bottom, left} = caretRect;
    const mid = (top + bottom) / 2;

    if (mid <= rect.top || mid <= rect.bottom && left <= rect.left) {
      return -1;
    }

    if (mid >= rect.bottom || mid >= rect.top && left >= rect.right) {
      return 1;
    }

    // not yet implemented
    throw new Error('Unexpected value, not yet implemented');
  });
}

function getCandidateIndex(textNode, point) {
  const failed = {match: null, index: -1};
  let candidates = Array.prototype.slice.call(textNode.parentNode.getClientRects());

  while (candidates.length) {
    const match = getNearestRectForPoint(candidates, point);
    if (!match) return failed;

    const index = getSomeIndexWithinRect(textNode, match);
    if (index !== -1) return {match, index};

    // try again after removing this rect.
    candidates = candidates.filter(rr => rr !== match);
  }
  return failed;
}

function getClosestIndexToPointIncrementally(textNode, initial, point, rect, increment) {
  let candidate = null;
  let lastDistance = Infinity;
  let pos = initial;

  while (pos >= 0 && pos <= textNode.length) {
    const caretRect = getCaretAtTextNodePosition(textNode, pos);
    // TODO: use intersects
    let distance = Infinity;

    if (isCaretWithinRect(caretRect, rect)) {
      distance = Math.abs(point.x - caretRect.left);
    } else {
      const altCaretRect = getCaretAtTextNodePosition(textNode, pos, true);
      if (isCaretWithinRect(altCaretRect, rect)) {
        distance = Math.abs(point.x - altCaretRect.left);
      }
    }

    if (distance > lastDistance) {
      return candidate;
    }
    lastDistance = distance;
    candidate = pos;
    pos += increment;
  }
  return candidate;
}

function getClosestIndexToPoint(textNode, initial, point, rect) {
  let lastDistance = Infinity;
  let candidate = null;

  [
    getClosestIndexToPointIncrementally(textNode, initial, point, rect, 1),
    getClosestIndexToPointIncrementally(textNode, initial, point, rect, -1)
  ].forEach(pos => {
    if (isNaN(pos)) return;

    if (pos > 0) {
      consider(pos - 1, true);
    }
    consider(pos, false);
    consider(pos, true);
    if (pos < textNode.nodeValue.length) {
      consider(pos + 1, false);
    }
  });
  return candidate;

  function consider(index, isWrapped) {
    const inner = getCaretAtTextNodePosition(textNode, index, isWrapped);
    if ((inner.top <= point.y && point.y <= inner.bottom) || isCaretWithinRect(inner, rect)) {
      // check distance
      const distance = Math.abs(inner.left - point.x);
      if (distance < lastDistance) {
        lastDistance = distance;
        candidate = {index, isWrapped};
      }
    }
  }
}

export default function getTextPositionForPoint(textNode, point) {
  const elt = textNode.parentNode;

  if (elt.children.length || elt.childNodes.length !== 1) {
    throw new Error('Text node should be single child of parent element');
  }

  const {match, index} = getCandidateIndex(textNode, point);
  if (index === -1) {
    return;
  }
  return getClosestIndexToPoint(textNode, index, point, match);
};
