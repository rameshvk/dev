'use strict';

export default function isEqual(r1, r2) {
  if (!r1 !== !r2) return false;
  if (r1 === r2) return true;
  return r1.top === r2.top && r1.bottom === r2.bottom && r1.left === r2.left && r1.right === r2.right;
}
