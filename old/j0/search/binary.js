'use strict';

export default function binarySearch(start, end, predicate) {
  let ss = start, ee = end;
  while (ss < ee) {
    const mid = Math.floor((ss + ee) / 2);
    const result = predicate(mid);
    if (result === 0) return mid;
    if (result > 0) ee = mid - 1;
    else if (result < 0) ss = mid + 1;
  }

  return (ss === ee && 0 === predicate(ss)) ? ss : -1;
};
