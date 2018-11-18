'use strict';

import * as unicode from '../../string/unicode';
import {min, max} from '../../dom/minmax';
import TextNodeIterator from './TextNodeIterator'
import getCaretAtTextNodePosition from '../../dom/getCaretAtTextNodePosition';
import getTextNodeInfoForPoint from '../../dom/getTextNodeInfoForPoint';
import findAncestor from '../../dom/findAncestor';
import matches from '../../dom/matches';

export default class ImmutableTextSelection {
  constructor(info) {
    this.copyFrom(info);
    // maintained for up/down navigation, never copied
    this.lastCaretLeft = null;
  }

  copyFrom({anchorId, anchorOffset, anchorWrapped, focusId, focusOffset, focusWrapped}) {
    this.anchorId = anchorId;
    this.anchorOffset = anchorOffset;
    this.anchorWrapped = anchorWrapped;
    this.focusId = focusId;
    this.focusOffset = focusOffset;
    this.focusWrapped = focusWrapped;
    this.lastCaretLeft = null;
    return this;
  }

  setFocus({focusId, focusOffset, focusWrapped}) {
    return new this.constructor({
      anchorId: focusId,
      anchorOffset: focusOffset,
      anchorWrapped: focusWrapped,
      focusId,
      focusOffset,
      focusWrapped,
    });
  }

  extendFocus({focusId, focusOffset, focusWrapped}) {
    return new this.constructor({
      anchorId: this.anchorId,
      anchorOffset: this.anchorOffset,
      anchorWrapped: this.anchorWrapped,
      focusId,
      focusOffset,
      focusWrapped,
    });
  }

  clickExtend({focusId, focusOffset}) {
    const anchor = min(this.anchorId, this.anchorOffset, this.focusId, this.focusOffset, focusId, focusOffset);
    const focus = max(this.anchorId, this.anchorOffset, this.focusId, this.focusOffset, focusId, focusOffset);
    return new this.constructor({
      anchorId: anchor.id,
      anchorOffset: anchor.offset,
      anchorWrapped: true,
      focusId: focus.id,
      focusOffset: focus.offset,
      focusWrapped: false,
    });
  }

  getNextCursorVertically(isUp, rootNode) {
    const multiplier = isUp ? -1 : 1;
    const root = rootNode || findAncestor(document.getElementById(this.focusId), node => matches(node, '.j0editor'));
    const textSelector = '.j0text';
    const caretRect = getCaretAtTextNodePosition(
      document.getElementById(this.focusId).firstChild, this.focusOffset, this.focusWrapped
    );
    const left = (this.lastCaretLeft === null) ? caretRect.left : this.lastCaretLeft;
    let mid = caretRect.top + multiplier * (caretRect.height/2);
    let nodeInfo = getTextNodeInfoForPoint(root, {x: left, y: mid}, textSelector);
    while (!isValidNodeInfo(nodeInfo, self)) {
      mid += multiplier * (caretRect.height/2);
      if (mid <= 0 || mid > document.body.clientHeight) break;
       nodeInfo = getTextNodeInfoForPoint(root, {x: left, y: mid}, textSelector);
    }
    if (mid <= 0) {
      // reached start of document, pick first node.
      const node = root.querySelector(textSelector);
      return {focusId: node.id, focusOffset: 0, focusWrapped: false};
    } else if (mid > document.body.clientHeight) {
      const nodes = root.querySelectorAll(textSelector);
      const node = nodes[nodes.length - 1];
      return {focusId: node.id, focusOffset: node.firstChild.nodeValue.length, focusWrapped: false};
    }
    nodeInfo.lastCaretLeft = left;
    return nodeInfo;

    function isValidNodeInfo(info, self) {
      if (!info) return false;
      if (info.focusId === self.focusId && info.focusOffset === self.focusOffset) return false;
      const rect = getCaretAtTextNodePosition(
        document.getElementById(info.focusId).firstChild, info.focusOffset, info.focusWrapped);
      const mid = (rect.top + rect.bottom) / 2;
      if (isUp) return mid < caretRect.top;
      return mid > caretRect.bottom;
    }
  }

  moveCursorVertically(isUp, rootNode) {
    const nextInfo = this.getNextCursorVertically(isUp, rootNode);
    const next = this.setFocus(nextInfo);
    if (nextInfo.lastCaretLeft !== null) next.lastCaretLeft = nextInfo.lastCaretLeft;
    return next;
  }

  extendCursorVertically(isUp, rootNode) {
    const nextInfo = this.getNextCursorVertically(isUp, rootNode);
    const next = this.extendFocus(nextInfo);
    if (nextInfo.lastCaretLeft !== null) next.lastCaretLeft = nextInfo.lastCaretLeft;
    return next;
  }

  moveCursor(isForward) {
    if (!this.isCollapsed()) return this.collapse(isForward);

    return this.setFocus(
      TextNodeIterator[isForward ? 'nextCursor' : 'previousCursor'](this)
    );
  }

  extendCursor(isForward) {
    return this.extendFocus(
      TextNodeIterator[isForward ? 'nextCursor' : 'previousCursor'](this)
    );
  }

  moveWord(isForward) {
    return this.setFocus(
      TextNodeIterator[isForward ? 'nextWord' : 'previousWord'](this)
    );
  }

  extendWord(isForward) {
    return this.extendFocus(
      TextNodeIterator[isForward ? 'nextWord' : 'previousWord'](this)
    );
  }

  selectWord() {
    return new this.constructor(TextNodeIterator.selectWord(this));
  }

  selectParagraph() {
    return new this.constructor(TextNodeIterator.selectParagraph(this));
  }

  collapse(isForward) {
    const minOrMax = isForward ? max : min;
    const collapsed = minOrMax(this.focusId, this.focusOffset, this.anchorId, this.anchorOffset);
    return new this.constructor({
      anchorId: collapsed.id,
      anchorOffset: collapsed.offset,
      anchorWrapped: !isForward,
      focusId: collapsed.id,
      focusOffset: collapsed.offset,
      focusWrapped: !isForward,
    });
  }

  isCollapsed() {
    return this.focusId === this.anchorId && this.focusOffset === this.anchorOffset;
  }
}
