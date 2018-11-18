'use strict';

const React = require('react');
const _ = require('lodash');

const isObject = elt => (elt.getAttribute && elt.getAttribute('contenteditable') === 'false');

/**
 * The RichTextCore component can be used to render rich text.  Rich text is considered to be a
 * sequence of styled text or embedded objects.  Styled text can be rendered with TextPart and
 * embedded objects can be rendered with InlineObjectPart and BlockObjectPart.
 * The main purpose of this component is to provide access to the three methods below which
 * operate on the DOM and provide enough support to be able to implement custom carets, selections
 * navigations etc.
 * 1. getPointInfo (useful to map x, y to a position in the rich text object model)
 * 2. getCaretRects (useful to render carets)
 * 3. getLineRectsForRange (useful for rendering selections)
 *
 * Note that these methods work directly off the DOM and so care must be taken to not assume
 * that the DOM matches the props as React may be in the middle of an asynchronous render cycle.
 * In particular, these functions do not read either the props or the state of the text view.
 * NB: The following caret positioning model is assumed everywhere:
 * 1.  Each text character gets a caret position.  Note that some unicode characters are multiple
 *     JS characters and so they effectively take multiple caret positions.
 * 2.  Each object gets a single caret position -- so it is not possible to position a caret inside
 *     an object.  There is a plan to eventually support nested rich-text-views to make this work
 *     seamlessly.
 */
class RichTextCore extends React.PureComponent {
  static get propTypes() {
    return {isEditable: React.PropTypes.bool.isRequired};
  }

  render() {
    const {isEditable, attributes} = this.props;
    const props = {contentEditable: isEditable, tabIndex: -1};
    const isEmpty = React.Children.count(this.props.children) === 0;
    const children = isEmpty ? React.DOM.span({}, '') : this.props.children;
    return React.DOM.span(Object.assign({}, attributes, props, {children}));
  }

  /**
   * getPointInfo calculates position info for a given viewport coordinate (x, y)
   * The returned info is of the form {offset, isLeft} where:
   *   offset captures the caret position (0 implies start)
   *   and isLeft is used to clarify the case where a caret position in the middle
   *   of a wrapped text can refer to the top line or bottom line.  If this is true,
   *   it maps to the top line.
   *
   * The actual caret rect can be computed via getCaretRects(offset)[Number(!isLeft)]
   */
  static getPointInfo(root, x, y) { return getPointInfo(root, x, y); }

  /**
   * getCaretRects calculates the DOMRects which represent the position of the caret
   * corresponding to the provided offset in viewport coordinates.
   * Note that a single offset at the start of a word that has wrapped can have two
   * caret positions. So, this method always returns an array of one or two rects.
   */
  static getCaretRects(root, offset) { return getCaretRects(root, offset); }

  /**
   * getLineRectsForRange takes a given start and end offsets and computes the set
   * of rectangles needed to render the corresponding selection.   Since the rects
   * can be uneven, it smoothes them so that:
   *   a) all rectangles that visually appear to be on the same line are grouped
   *   b) the bounding rects for such grouped rectanges are computed
   * The return value is a sorted sequence of bounding rects -- top to bottom.
   */
  static getLineRectsForRange(root, start, end) { return getLineRectsForRange(root, start, end); }
}

/**
 * use InlineObjectPart as a child of RichTextCore to render inline objects. Inline objects
 * are represented as `span[contenteditable=false]` and can have any inline elements as children.
 * If you must nest more objects within InlineObjectPart, please use ObjectPart.  This does not
 * currently work well with selection rectangle calculations but the intention is to support it.
 */
class InlineObjectPart extends React.PureComponent {
  render() {
    const {attributes, children} = this.props;
    return React.DOM.span(Object.assign({}, attributes, {contentEditable: false, children}));
  }
}

/**
 * Use BlockObjectPart to represent inline-block and block elements.  They are represented as
 * div[contenteditable=true] and styling as 'inline-block' can be done via `attributes`.
 */
class BlockObjectPart extends React.PureComponent {
  render() {
    const {attributes, children} = this.props;
    return React.DOM.div(Object.assign({}, attributes, {contentEditable: false, children}));
  }
}

/**
 * Use TextPart as a child of RichTextCore to render styled text.
 */
class TextPart extends React.PureComponent {
  static get propTypes() {
    return {text: React.PropTypes.string.isRequired};
  }

  render() {
    const {attributes, text} = this.props;
    return React.DOM.span(attributes || {}, text);
  }
}

exports.RichTextCore = RichTextCore;
exports.InlineObjectPart = InlineObjectPart;
exports.BlockObjectPart = BlockObjectPart;
exports.TextPart = TextPart;

//
// Private Implementation
//

//
// getPointInfo
//

function getPointInfo(root, x, y) {
  const infos = _.map(root.childNodes, elt => {
    // TODO: walk down inline objects to get better support for rects
    const node = isObject(elt) ? elt : elt.childNodes[0];
    const isBlockLike = isObject(elt) && node.tagName !== "SPAN";
    const count = isObject(elt) ? 1 : node.length;
    const rects = isBlockLike ? [node.getBoundingClientRect()] : getClientRects(elt);
    return {elt, node, isObject: isObject(elt), count, rects};
  });
  // TODO:  change this to do getNearestRect on all the line rects instead of raw rects.
  // Raw rects have a bug where they do not account of jagged inline blocks.
  let index = getNearestRect(_.flatMap(infos, 'rects'), x, y);
  for (let kk = 0, seen = 0, seenOffset = 0; kk < infos.length; kk ++) {
    const info = infos[kk];
    if (index >= seen && index < seen + info.rects.length) {
      if (info.isObject) {
        const {left} = info.rects[0], {right} = info.rects[info.rects.length - 1];
        if (Math.abs(left - x) < Math.abs(right - x)) return {offset: seenOffset, isLeft: true};
        return {offset: seenOffset + 1, isLeft: false};
      }
      const {offset, isLeft} = getPointInfoForTextNode(info.node, x, y, info.rects[index - seen]);
      return {offset: offset + seenOffset, isLeft};
    }
    seen += info.rects.length;
    seenOffset += info.count;
  }
}

/**
 * getPositionInfoForTextNode returns {offset, isLeft} where
 *   offset is the position within the text node that is horizontally closest to x while
 *   also being in the same vertical line as {top, bottom}.
 * x, y, top and bottom are in viewport coordinates.
 */
function getPointInfoForTextNode(node, x, y, {top, bottom}) {
  const len = node.nodeValue.length;
  if (len === 0) return {offset: 0, isLeft: true};

  // use a cache to simplify repeated calls to gather info at same position
  const cache = {};
  const getPositionInfo = ii => (cache[ii] = cache[ii] || getTextNodePositionInfo(node, ii, x, top, bottom));

  // find an index which is in same vertical line as {top, bottom}
  let index = binarySearch(0, len, ii => getPositionInfo(ii).comparison);

  // find first index that matches this constraint
  while (index > 0 && getPositionInfo(index - 1).comparison === 0) index --;

  // walk indices forward if horizontal distance to x keeps shrinking
  while (index < len && getPositionInfo(index + 1).distance < getPositionInfo(index).distance) index ++;

  // result.
  return {offset: index, isLeft: getPositionInfo(index).isLeft};
}

/**
 * getTextNodePositionInfo returns {rects, distance, isLeft, comparison} where
 * a) if rect does not intersection {top, bottom}, distance is Infinity
 * b) otherwise distance = distance from x
 * c) the comparision field is useful to do binary search (it is set to -1, 0, 1 depending
 *    on whether the caret at position ii is above, matching or below [top, bottom])
 * since there can be multilple client rects, this gives the value for the closest
 * and sets isLeft depending on it.
 */
function getTextNodePositionInfo(node, ii, x, top, bottom) {
  const rects = getClientRects(node, ii, ii);
  const rect = _.find(rects, rr => (rr.bottom > top && rr.top < bottom));
  const distance = rect ? Math.min(Math.abs(rect.left - x), Math.abs(rect.right - x)) : Infinity;
  const comparison = rect ? 0 : Math.sign(Number(rects[0].top >= bottom) - 0.5);
  return {rects, distance, isLeft: rects[0] === rect, comparison};
}

//
// getCaretRects
//

function getCaretRects(root, offset) {
  const [left, right] = resolveOffset(root, offset);

  if (left && right) {
    // caret is between two text node or objects
    const ll = getEdgeRects(left.node), rr = getEdgeRects(right.node);
    return [ll[1], rr[0]];
  }

  if (isObject(left.node)) {
    const rect = getEdgeRects(left.node)[offset];
    return [rect, rect];
  }

  const rects = getClientRects(left.node, left.offset, left.offset);
  if (rects.length === 1) return [rects[0], rects[0]];
  return [rects[0], rects[rects.length - 1]];
}


/**
 * resolveOffset takes an offset and returns a {node, offset} of the form used by DOM
 * Range object to represent it.
 * It is possible for multiple representations but resolveOffset only chooses a TextNode
 * which is a child of a direct descendant of root or a [contentEditable=false] node that
 * is a direct descendant of root.  It is still possible to get multiple matching values
 * if the choosen offset is at the end of a text node and before a contentediable=false
 * node.  In this case it returns both.
 * The return value is an array with either one or two elements.
 */
function resolveOffset(root, offset) {
  const result = [];
  const nodes = root.childNodes;
  let last = null, seen = 0;

  for (let kk = 0, len = nodes.length; kk < len; kk ++) {
    const node = isObject(nodes[kk]) ? nodes[kk] : nodes[kk].childNodes[0];
    const count = node.nodeType === node.TEXT_NODE ? node.nodeValue.length : 1;
    if (seen <= offset && seen + count >= offset) result.push({node, offset: offset - seen});
    if (seen + count > offset) break;
    seen += count;
    last = {node, offset: count};
  }
  return result.length > 0 ? result : [last];
}

//
// getLineRectsForRange
//

function getLineRectsForRange(root, start, end) {
  const ll = resolveOffset(root, start).slice(-1)[0];
  const rr1 = resolveOffset(root, end);
  const rr = rr1[0].node.nodeType === rr1[0].node.ELEMENT_NODE && rr1[0].offset === 1 && rr1[1] || rr1[0];
  const range = document.createRange();
  range.setStart(ll.node, ll.offset);
  range.setEnd(rr.node, rr.offset);
  const rects = _.slice(range.getClientRects());

  const caretRect = getCaretRects(root, start)[1];
  const caretMid = (caretRect.top + caretRect.bottom) / 2;
  if (rects[0].width < 0.1 && rects[0].bottom < caretMid) {
    // chrome has an ugly bug that after newlines, it provides an incorrect client rect
    // that includes a position before the newline.  clear that out
    rects.splice(0, 1);
  }
  const lines = groupRectsIntoLines(rects);
  const lineRects = _.sortBy(_.map(lines, getBoundingRect), 'top');
  const len = lineRects.length;
  return _.map(lineRects, ({left, right, top, bottom}, index) => {
    if (lineRects[index + 1] && lineRects[index + 1].top > bottom) {
      bottom = (bottom + lineRects[index + 1].top) / 2;
    }
    if (lineRects[index -  1] && lineRects[index - 1].bottom < top) {
      top = (top + lineRects[index - 1].bottom) / 2;
    }
    return {left, right, top, bottom, width: right - left, height: bottom - top};
  });
}

//
// Dom utils
//

function getClientRects(elt, start, end) {
  const rr = document.createRange();
  if (arguments.length < 2) {
    rr.setStart(elt, 0);
    rr.setEnd(elt, elt.nodeType === elt.TEXT_NODE ? elt.nodeValue.length : elt.childNodes.length);
  } else {
    rr.setStart(elt, start);
    rr.setEnd(elt, end || start);
  }
  return Array.prototype.slice.call(rr.getClientRects());
}

function getEdgeRects(node) {
  if (node.nodeType === node.ELEMENT_NODE && node.tagName !== 'SPAN') {
    // non-inline object node
    const rect = node.getBoundingClientRect();
    return [leftRect(rect), rightRect(rect)];
  }

  // either text node or an inline object node
  const rects = getClientRects(node);
  return [leftRect(rects[0]), rightRect(rects[rects.length - 1])];
}

//
// utils
//

function binarySearch(start, end, predicate) {
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

const isPointInRect = ({left, right, top, bottom}, x, y) => x >= left && x <= right && y >= top && y <= bottom;

const leftRect = ({left, top, bottom}) => ({left, right: left, top, bottom, width: 0, height: bottom - top});
const rightRect = ({right, top, bottom}) => ({left: right, right, top, bottom, width: 0, height: bottom - top});
const xDistance = ({left, right}, x) => Math.min(Math.abs(left - x), Math.abs(right - x));
const yDistance = ({top, bottom}, y) => Math.min(Math.abs(top - y), Math.abs(bottom - y));

function areRectsOnSameLine(a, b) {
  const intersects = ({top, bottom}, rect) => {
    const mid = (top + bottom) / 2;
    return (rect.top >= top && rect.top <= mid) || (rect.bottom >= mid && rect.bottom <= bottom);
  };
  return intersects(a, b) || intersects(b, a);
}

function getBoundingRect(rects) {
  const {left} = _.minBy(rects, 'left'), {right} = _.maxBy(rects, 'right');
  const {top} = _.minBy(rects, 'top'), {bottom} = _.maxBy(rects, 'bottom');
  return {top, left, bottom, right, width: right - left, height: bottom - top};
}

function groupRectsIntoLines(rects) {
  return _.reduce(_.sortBy(rects, 'top'), (lines, rect) => {
    const prev = lines.length && lines[lines.length - 1][0];
    if (!prev || !areRectsOnSameLine(prev, rect)) lines.push([rect]);
    else lines[lines.length - 1].push(rect);
    return lines;
  }, []);
}

function getNearestRect(rects, x, y) {
  const lines = groupRectsIntoLines(rects);
  const lineRects = _.map(lines, getBoundingRect);

  // find the right line
  let result = 0;
  for (let kk = 1; kk < lines.length; kk ++) {
    if (isPointInRect(lineRects[kk], lineRects[kk].left, y) || yDistance(lineRects[kk], y) < yDistance(lineRects[result], y)) result = kk;
  }

  // find the right rect
  const line = lines[result];
  result = 0;
  for (let kk = 1; kk < line.length; kk ++) {
    if (isPointInRect(line[kk], x, line[kk].top) || xDistance(line[kk], x) < xDistance(line[result], x)) result = kk;
  }
  return _.indexOf(rects, line[result]);
}
