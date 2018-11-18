'use strict';

import isPointInRect from './isPointInRect.js';

const epsilon = 0.0001;

function isSameLine({left, right, top, bottom}, y) {
  return y >= top && y <= bottom;
}

function getXDistance({left, right, top, bottom}, x) {
  return Math.min(Math.abs(left - x), Math.abs(right - x));
}

function getYDistance({left, right, top, bottom}, y) {
  return Math.min(Math.abs(top - y), Math.abs(bottom - y));
}

export default function getNearestRectForPoint(rects, {x, y}) {
  let lastDistance = Infinity, candidate = null;
  for (let len = rects.length, kk = 0, rect = rects[kk]; kk < len; kk ++, rect = rects[kk]) {
    if (isPointInRect(rect, {x, y})) return rect;
    if (isSameLine(rect, y)) {
      const distance = getXDistance(rect, x);
      if (distance < lastDistance) {
        lastDistance = distance;
        candidate = rect;
      }
    }
  }

  // if there is a candidate on same line, return that candidate.
  if (candidate) return candidate;
  if (rects.length === 0) return candidate;

  candidate = rects[0];
  lastDistance = getYDistance(candidate, y);

  for (let len = rects.length, kk = 1, rect = rects[kk]; kk < len; kk ++, rect = rects[kk]) {
    const distance = getYDistance(rect, y);
    if (distance > lastDistance + epsilon) continue;
    if (Math.abs(distance - lastDistance) < epsilon) {
      if (getXDistance(rect, x) > getXDistance(candidate, x)) continue;
    }
    lastDistance = distance;
    candidate = rect;
  }
  return candidate;
}
