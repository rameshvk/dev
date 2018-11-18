'use strict';

const InlineDisplayTypes = {
  inline: true,
  'inline-list-item': true,
  contents: true,
};

const WeakInlineDisplaytypes = {
  inline: true,
  'inline-block': true,
  'inline-table': true,
  'inline-flex': true,
  'inline-grid': true,
};


export default function isInlineNode(node, considerInlineBlockAsInline) {
  const display = window.getComputedStyle(node).display;
  const map = considerInlineBlockAsInline ? WeakInlineDisplayTypes : InlineDisplayTypes;
  return map[display] === true;
}
