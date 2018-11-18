'use shape';

export default function isRectWithinRect(inner, outer) {
  const {left, right, top, bottom} = inner;
  return left >= outer.left && right <= outer.right &&
    top >= outer.top && bottom <= outer.bottom;
};
