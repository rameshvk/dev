'use strict';

export default function getContentRect(elt, boundingRect) {
  const rect = boundingRect || elt.getBoundingClientRect();
  const style = window.getComputedStyle(elt);
  const left = rect.left + parseInt(style.borderLeftWidth, 10) + parseInt(style.paddingLeft, 10);
  const right = rect.right - parseInt(style.borderRightWidth, 10) - parseInt(style.paddingRight, 10);
  const top = rect.top + parseInt(style.borderTopWidth, 10) + parseInt(style.paddingTop, 10);
  const bottom = rect.bottom - parseInt(style.borderBottomWidth, 10) - parseInt(style.paddingBottom, 10);
  const width = right - left, height = bottom - top;
  return {left, right, bottom, top, width, height};
}
