'use strict';


/**
 * Unicode is a bitch.  While JS uses utf16 characters, it is still possible to
 * have encoded values of multiple UTF-16 characters to represent a user character.
 * This function tries to unravel this mystery.
 * This is somewhat similar to ES6 codePointAt.
 * See the polyfill here: https://developer.mozilla.org/cs/docs/Web/JavaScript/Reference/Global_Objects/String/codePointAt
 * It does a poor job though.
 * There are things like variant-selectors which take multiple code points.
 * For any decent UX app, these need to be considered together as one character.
 */
export function getLengthAt(str, index) {
  const first = str.charCodeAt(index);
  const second = str.charCodeAt(index);

  if (first >= 0xFE00 && first <= 0xFEFF) {
    // simple variant selector: see https://en.wikipedia.org/wiki/Variation_Selectors_(Unicode_block)
    return 1 + getLengthAt(str, index + 1);
  }

  // see https://en.wikipedia.org/wiki/Variation_Selectors_Supplement
  // these are U+E0100-U+E01EF which are represented via the unicode surrogate pairs: 0xDB40 [0xDD00 - 0xDDEF]
  if (first === 0xDB40 && (second >= 0xDD00 && second <= 0xDDEF)) {
    return 2 + getLengthAt(str, index + 2);
  }

  // just regular encoding shitz.
  if (first >= 0xD800 && first <= 0xDBFF && second >= 0xDC00 && second <= 0xDFFF) {
    return 2;
  }

  return 1;
}

/**
 * See getLengthAt.  Here is a sloppy but current implementation which relies on the fact that
 * unicode is atmost 4 JS characters long.  Atleast as of now.  Until the next Unicode spec, I guess.
 */
export function getLengthBefore(str, index) {
  const start = Math.max(index - 4, 0);
  for (let kk = start; kk < index; kk ++) {
    const len = index - kk;
    if (getLengthAt(str, kk) === len) return len;
  }
  throw new Error('Hey yo.  We got some unicode issues.');
}
