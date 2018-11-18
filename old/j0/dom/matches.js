'use string';

export default function matches(node, selector) {
  if (node.matches) return node.matches(selector);
  if (node.msMatchesSelector) return node.msMatchesSelector(selector);
  if (node.mozMatchesSelector) return node.mozMatchesSelector(selector);
}
