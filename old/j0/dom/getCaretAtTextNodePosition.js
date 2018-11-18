'use strict';

import getCaretsAtTextNodePosition from "./getCaretsAtTextNodePosition.js";

export default function getCaretAtTextNodePosition(textNode, index, isWrapped) {
  if (!textNode) return null;
  const carets = getCaretsAtTextNodePosition(textNode, index);
  if (!isWrapped || carets.length === 1) {
    return carets[0];
  }
  return carets[carets.length - 1];
};
