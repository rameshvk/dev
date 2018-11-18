'use strict';

import clone from './clone.js';

function isSameLineOneWay({top, bottom}, rect) {
  const mid = (top + bottom)/2;
  return (rect.top >= top && rect.top <= mid) ||
    (rect.bottom >= mid && rect.bottom <= bottom);
}

function isSameLine(a, b) {
  return isSameLineOneWay(a, b) || isSameLineOneWay(b, a);
}

function groupRectsIntoLines(rects) {
  const sorted = rects.slice().sort((a, b) => a.top - b.top);

  return sorted.reduce((lines, rect) => {
    const lineRect = lines.length && lines[lines.length - 1][0];
    if (lineRect && isSameLine(lineRect, rect)) lines[lines.length - 1].push(rect);
    else lines.push([rect]);
    return lines;
  }, []);
}

function getBoundingRect(rects) {
  let minLeft = Infinity, minTop = Infinity, maxRight = -Infinity, maxBottom = -Infinity;
  rects.forEach(rect => {
    const {left, right, top, bottom} = rect;
    if (left < minLeft) minLeft = left;
    if (top < minTop) minTop = top;
    if (right > maxRight) maxRight = right;
    if (bottom > maxBottom) maxBottom = bottom;
  });
  return {left: minLeft, right: maxRight, top: minTop, bottom: maxBottom};
}

function coalesceTwoLineRects([top, bottom]) {
  if (top.bottom === bottom.top) return [top, bottom];
  const clonedTop = clone(top), clonedBottom = clone(bottom);
  clonedTop.bottom = Math.min(top.bottom, bottom.top);
  clonedBottom.top = Math.max(top.bottom, bottom.top);
  const left = Math.min(top.left, bottom.left), right = Math.max(top.right, bottom.right);
  const intermediate = {top: clonedTop.bottom, bottom: clonedBottom.top, left, right};
  return [clonedTop, intermediate, clonedBottom];
}

function coalesceLineRects(rects) {
  const result = rects.slice();
  for (let kk = 1; kk < result.length; kk ++) {
    const coalesced = coalesceTwoLineRects([result[kk - 1], result[kk]]);
    result[kk - 1] = coalesced[0];
    result[kk] = coalesced[1];
    if (coalesced.length === 3) {
      kk ++;
      result.splice(kk, 0, coalesced[2]);
    }
  }
  return result;
}

function leftAlignRects(rects) {
  const leftAligned = rects.reduce((minLeft, {left}) => left < minLeft ? left : minLeft, Infinity);
  return rects.map(rect => Object.assign({}, rect, {left: leftAligned}));
}

function rightAlignRects(rects) {
  const rightAligned = rects.reduce((maxRight, {right}) => right > minRight ? right : maxRight, -Infinity);
  return rects.map(rect => Object.assign({}, rect, {right: maxRight}));
}

export default function getBoundingLineRects(rects, {shouldLeftAlign, shouldRightAlign}) {
  let lines = groupRectsIntoLines(rects).map(getBoundingRect);
  lines = coalesceLineRects(lines);
  if (shouldLeftAlign) lines = leftAlignRects(lines);
  if (shouldRightAlign) lines = rightAlignRects(lines);
  return lines;
}
