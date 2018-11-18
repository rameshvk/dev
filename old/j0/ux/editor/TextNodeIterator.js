'use strict';

import matches from '../../dom/matches';
import hasNewlineBetweenNodes from '../../dom/hasNewlineBetweenNodes';
import * as unicode from '../../string/unicode';

export default class TextNodeIterator {
  constructor({focusNode, focusId, focusOffset}, backwards) {
    this.focusNode = focusNode || document.getElementById(focusId);
    this.focusId = focusId;
    this.focusOffset = focusOffset;
    this.backwards = backwards;
  }

  // these are customizable
  isTextNode(node) { return matches(node, '.j0text'); }
  isRootNode(node) { return matches(node, '.j0editor'); }
  isAtomicObject(node) { return node.getAttribute('data-atomic') === 'true'; }
  hasLeftGap(node) { return node.getAttribute('data-lgap') === 'true'; }
  hasRightGap(node) { return node.getAttribute('data-rgap') === 'true'; }
  isEmpty(node) { return node.getAttribute('data-empty') === 'true'; }

  _isAtBounds() {
    if (this.backwards) return this.focusOffset === 0 || this.isEmpty(this.focusNode);
    const len = this.focusNode.firstChild.nodeValue.length;
    return this.focusOffset === len || this.isEmpty(this.focusNode);
  }

  _isAtGap() {
    const check = this.backwards ? 'hasLeftGap' : 'hasRightGap';
    return this[check](this.focusNode);
  }

  _getNextTextNode() {
    let candidate = this.focusNode;
    const nextField = this.backwards ? 'previousSibling' : 'nextSibling';
    const child = this.backwards ? 'lastElementChild' : 'firstElementChild';

    while (candidate && !this.isRootNode(candidate)) {
      if (!candidate[nextField]) {
        candidate = candidate.parentNode;
        continue;
      }
      candidate = candidate[nextField];
      if (this.isTextNode(candidate)) return candidate;

      // descend as long as this is not an atomic object and has children
      while (!this.isAtomicObject(candidate) && candidate[child]) candidate = candidate[child];
      if (this.isTextNode(candidate)) return candidate;
    }
    return null;
  }

  _getCurrentCharacter(gapSymbol, eolSymbol) {
    if (!this.focusNode) return null;
    const text = this.focusNode.firstChild.nodeValue;
    if (this._isAtBounds()) return this._isAtGap() ? gapSymbol : eolSymbol;

    if (this.backwards) {
      const len = unicode.getLengthBefore(text, this.focusOffset);
      return text.slice(this.focusOffset - len, this.focusOffset);
    } else {
      const len = unicode.getLengthAt(text, this.focusOffset);
      return text.slice(this.focusOffset, this.focusOffset + len);
    }
  }

  _getCharacter(shouldSkipGaps, shouldStopAtNewlineBetweenNodes) {
    const gap = {}, eol = {};

    let ch = this._getCurrentCharacter(gap, eol);
    while (ch) {
      if (ch === gap && !shouldSkipGaps) return null;
      if (ch !== eol && ch !== gap) return ch;

      // ch is eol or gap, need to find next text node
      const node = this._getNextTextNode();
      if (!node) return null;

      if (shouldStopAtNewlineBetweenNodes && hasNewlineBetweenNodes(this.focusNode, node, this.isAtomicObject)) {
        return null;
      }

      this.focusNode = node;
      this.focusId = node.id;
      this.focusOffset = this.backwards ? node.firstChild.nodeValue.length : 0;
      ch = this._getCurrentCharacter(gap, eol);
    }
    return null;
  }

  moveToNextCursor() {
    while (this._isAtBounds()) {
      const wasAtGap = this._isAtGap();
      const wasAtNode = this.focusNode;
      const node = this._getNextTextNode();
      if (!node) return this;
      this.focusNode = node;
      this.focusId = node.id;
      this.focusOffset = this.backwards ? node.firstChild.nodeValue.length : 0;
      if (wasAtGap || hasNewlineBetweenNodes(wasAtNode, node, this.isAtomicObject)) return this;
    }

    const ch = this._getCurrentCharacter(null, null);
    this.focusOffset += this.backwards ? -ch.length : ch.length;
    return this;
  }

  moveToNextWord() {
    let advanced = 0;
    let ch = this._getCharacter(false);
    while (ch && /\s/.test(ch)) {
      this.focusOffset += this.backwards ? -ch.length : ch.length;
      ch = this._getCharacter(true);
    }
    while (ch && /\S/.test(ch)) {
      advanced ++;
      this.focusOffset += this.backwards ? -ch.length : ch.length;
      ch = this._getCharacter(false);
    }
    // if we are blocked by a gap, move one over
    if (advanced === 0) this.moveToNextCursor();
    return this;
  }

  moveToEndOfWord() {
    const shouldSkipGaps = false;
    const shouldStopAtNewlineBetweenNodes = true;
    let advanced = 0;
    let ch = this._getCharacter(shouldSkipGaps, shouldStopAtNewlineBetweenNodes);
    while (ch && /\S/.test(ch)) {
      advanced ++;
      this.focusOffset += this.backwards ? -ch.length : ch.length;
      ch = this._getCharacter(shouldSkipGaps, shouldStopAtNewlineBetweenNodes);
    }
    if (advanced === 0 && !this.backwards) this.moveToNextCursor();
    return this;
  }

  moveToEndOfParagraph() {
    const shouldSkipGaps = true;
    const shouldStopAtNewlineBetweenNodes = true;
    let advanced = 0;
    let ch = this._getCharacter(shouldSkipGaps, shouldStopAtNewlineBetweenNodes);
    while (ch && ch !== '\n' && ch !== '\r') {
      advanced ++;
      this.focusOffset += this.backwards ? -ch.length : ch.length;
      ch = this._getCharacter(shouldSkipGaps, shouldStopAtNewlineBetweenNodes);
    }
    if (advanced === 0 && !this.backwards) this.moveToNextCursor();
    return this;
  }

  static nextCursor(info) {
    const iter = new TextNodeIterator(info, false);
    iter.moveToNextCursor();
    return {
      focusNode: iter.focusNode,
      focusId: iter.focusId,
      focusOffset: iter.focusOffset,
      focusWrapped: false
    };
  }

  static previousCursor(info) {
    const iter = new TextNodeIterator(info, true);
    iter.moveToNextCursor();
    return {
      focusNode: iter.focusNode,
      focusId: iter.focusId,
      focusOffset: iter.focusOffset,
      focusWrapped: true
    };
  }

  static nextWord(info) {
    const iter = new TextNodeIterator(info, false);
    iter.moveToNextWord();
    return {
      focusNode: iter.focusNode,
      focusId: iter.focusId,
      focusOffset: iter.focusOffset,
      focusWrapped: true
    };
  }

  static previousWord(info) {
    const iter = new TextNodeIterator(info, true);
    iter.moveToNextWord();
    return {
      focusNode: iter.focusNode,
      focusId: iter.focusId,
      focusOffset: iter.focusOffset,
      focusWrapped: true
    };
  }

  static selectWord(info) {
    const iterFocus = new TextNodeIterator(info, false);
    const iterAnchor = new TextNodeIterator(info, true);
    iterFocus.moveToEndOfWord();
    iterAnchor.moveToEndOfWord();
    return {
      anchorNode: iterAnchor.focusNode,
      anchorId: iterAnchor.focusId,
      anchorOffset: iterAnchor.focusOffset,
      anchorWrapped: true,
      focusNode: iterFocus.focusNode,
      focusId: iterFocus.focusId,
      focusOffset: iterFocus.focusOffset,
      focusWrapped: false
    };
  }

  static selectParagraph(info) {
    const iterFocus = new TextNodeIterator(info, false);
    const iterAnchor = new TextNodeIterator(info, true);
    iterFocus.moveToEndOfParagraph();
    iterAnchor.moveToEndOfParagraph();
    return {
      anchorNode: iterAnchor.focusNode,
      anchorId: iterAnchor.focusId,
      anchorOffset: iterAnchor.focusOffset,
      anchorWrapped: true,
      focusNode: iterFocus.focusNode,
      focusId: iterFocus.focusId,
      focusOffset: iterFocus.focusOffset,
      focusWrapped: false
    };
  }
}
