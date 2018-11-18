'use strict';

function getHeight(textNode) {
  return parseInt(window.getComputedStyle(textNode.parentNode).lineHeight);
}

function trimRectToHeight(rect, height) {
  if (rect.height > height) {
    return {top: rect.bottom - height, left: rect.left, right: rect.right, bottom: rect.bottom, height, width: rect.width};
  }
  return rect;
}

export default function getCaretsAtTextNodePosition(textNode, index) {
  const range = document.createRange();
  range.setStart(textNode, index);
  range.setEnd(textNode, index);
  const rects = range.getClientRects();
  const first = rects[0], last = rects[rects.length - 1];
  const text = textNode.nodeValue;
  const height = getHeight(textNode);
  if (text[index - 1] === '\n' || first === last) {
    // special case
    return [trimRectToHeight(last, height)];
  }
  return [trimRectToHeight(first, height), trimRectToHeight(last, height)];
};
