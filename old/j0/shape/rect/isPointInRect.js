'use strict';

export default function isPointInRect({left, right, top, bottom}, {x, y}) {
  return x >= left && x <= right && y >= top && y <= bottom;
}
