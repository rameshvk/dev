'use rect';

export default function intersects(rr1, rr2) {
  const ll = Math.max(rr1.left, rr2.left), rr = Math.min(rr1.right, rr2.right);
  const tt = Math.max(rr1.top, rr2.top), bb = Math.min(rr1.bottom, rr2.bottom);
  return ll < rr && tt < bb;
};
