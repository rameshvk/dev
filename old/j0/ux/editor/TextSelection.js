'use strict';

import ImmutableTextSelection from './ImmutableTextSelection.js';
import ScrollManager from '../../dom/ScrollManager.js';

export default class TextSelection extends ImmutableTextSelection {
  scrollIntoView() {
    ScrollManager.scrollTextIntoView(
      this.focusId, this.focusOffset, this.focusWrapped,
      ScrollManager.HORIZONTAL_AND_VERTICAL
    );
    if (this._attentionManager) {
      this._attentionManager.trackFocus(this.focusId, this.focusOffset, this.focusWrapped);
    }
    return this;
  }

  setAttentionManager(manager) {
    this._attentionManager = manager;
  }

  moveCursorVertically(isUp, root) {
    const result = super.moveCursorVertically(isUp, root);
    // in addition to copying over the result, we should copy over the
    // last basis value too.
    if (result.lastCaretLeft !== null) {
      this.lastCaretLeft = result.lastCaretLeft;
    }
  }

  extendCursorVertically(isUp, root) {
    const result = super.extendCursorVertically(isUp, root);
    // in addition to copying over the result, we should copy over the
    // last basis value too.
    if (result.lastCaretLeft !== null) {
      this.lastCaretLeft = result.lastCaretLeft;
    }
  }

  setFocus({focusId, focusOffset, focusWrapped}) {
    this.copyFrom(super.setFocus({focusId, focusOffset, focusWrapped}));
    return this.scrollIntoView();
  }

  extendFocus({focusId, focusOffset, focusWrapped}) {
    this.copyFrom(super.extendFocus({focusId, focusOffset, focusWrapped}));
    return this.scrollIntoView();
  }

  collapse(isForward) {
    this.copyFrom(super.collapse(isForward));
    return this.scrollIntoView();
  }

  onClick(clickCount, info) {
    if (clickCount === 1) return this.setFocus(info);
    if (clickCount === 2) {
      return this.copyFrom(this.selectWord());
    }
    return this.copyFrom(this.selectParagraph());
  }

  clickExtend(info) {
    return this.copyFrom(super.clickExtend(info));
  }
}
