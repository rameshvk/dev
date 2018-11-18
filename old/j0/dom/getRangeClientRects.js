'use string';

import getCaretAtTextNodePosition from './getCaretAtTextNodePosition.js';
import matches from './matches';
import traverseRange from './traverseRange';

function getTextNodeRects(node, start, end) {
  if (start === end) return [];
  const rr = document.createRange();
  rr.setStart(node, start);
  rr.setEnd(node, end);
  const results = Array.prototype.slice.call(rr.getClientRects());
  if (results[0].width === 0) {
    // special hack.  check if the rect matches the wrapped caret -- if not drop it.
    const caret = getCaretAtTextNodePosition(node, start, true);
    if (caret.top > results[0].top + results[0].height/2) return results.slice(1);
  }
  return results;
}

function getCommonAncestor(start, end) {
  const rr = document.createRange();
  rr.setStart(start, 0);
  rr.setEnd(end, 0);
  return rr.commonAncestorContainer;
}

function getNodeRects(node, textSelector) {
  if (node.nodeType === node.TEXT_NODE) return getTextNodeRects(node, 0, node.nodeValue.length);
  if (matches(node, textSelector)) return getTextNodeRects(node.firstChild, 0, node.firstChild.nodeValue.length);
  const display = window.getComputedStyle(node).display;
  if (display === 'none') return [];
  if (display !== 'inline') return [node.getBoundingClientRect()];
  let result = [];
  for (let kk = 0, len = node.children.length; kk < len; kk ++) {
    result = result.concat(getNodeRects(node.children[kk], textSelector));
  }
  return result;
}

function getIntermediateRects(start, end, textSelector) {
  return getIntermediateRectsWithAncestor(getCommonAncestor(start, end), start, end, textSelector);
}

function getIntermediateRectsWithAncestor(ancestor, start, end, textSelector) {
  let results = [];
  traverseRange(start, end, check, shouldDescend);
  return results;

  // TODO: check for object type nodes within?
  function shouldDescend(node) { return node.contains(start) || node.contains(end); }
  function check(node) {
    if (node.contains(start) || node.contains(end)) return;
    results = results.concat(node.getBoundingClientRect());
  }
}

export default function getRangeClientRects(anchor, anchorOffset, focus, focusOffset, textSelector) {
  textSelector = textSelector || '.text';
  if (anchor === focus) return getTextNodeRects(anchor, Math.min(anchorOffset, focusOffset), Math.max(anchorOffset, focusOffset));

  if (anchor.compareDocumentPosition(focus) === anchor.DOCUMENT_POSITION_FOLLOWING) {
    // normal order
    return getTextNodeRects(anchor, anchorOffset, anchor.nodeValue.length)
      .concat(getTextNodeRects(focus, 0, focusOffset))
      .concat(getIntermediateRects(anchor.parentNode, focus.parentNode));
  }
  return getTextNodeRects(anchor, 0, anchorOffset)
    .concat(getTextNodeRects(focus, focusOffset, focus.nodeValue.length))
    .concat(getIntermediateRects(focus.parentNode, anchor.parentNode));
}
