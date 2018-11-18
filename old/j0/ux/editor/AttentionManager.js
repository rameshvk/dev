'use strict';

import getScrollParent from '../../dom/getScrollParent';
import getCaretAtTextNodePosition from '../../dom/getCaretAtTextNodePosition';
import getContentRect from '../../dom/getContentRect';
import intersects from '../../shape/rect/intersects';

const ScrollWait = 1500;

export default class AttentionManager {
  constructor() {
    this._root = null;
    this._type = null; // no attention info
    this._id = null;
    this._offset = null;
    this._wrapped = null;
    this._left = null;
    this._top = null;
    this._hscroll = null;
    this._vscroll = null;
    this._afPending = null;
    this._afDeferUntil = 0;
    this._afTimestamp = 0;
    this._onAnimationFrameRefresh = ts => {
      const lastTs = this._afTimestamp;
      this._afTimestamp = ts;
      this._afPending = window.requestAnimationFrame(this._onAnimationFrameRefresh);
      if (ts > this._afDeferUntil) {
        if (lastTs < this._afDeferUntil) this.trackFirstVisibleElement();
        this.onAnimationFrameRefresh(ts);
      }
    }
    this._onScroll = () => { this._afDeferUntil = this._afTimestamp + ScrollWait; }
  }

  startTracking(root) {
    if (this._root) this.stopTracking();
    const hScroll = getScrollParent(root.firstChild, 'horizontal');
    const vScroll = getScrollParent(root.firstChild, 'vertical');

    if (!hScroll && !vScroll) throw new Error('Nothing to track');
    this._hScroll = hScroll;
    this._vScroll = vScroll;
    this._root = root;

    this._hScroll.addEventListener('scroll', this._onScroll);
    this._vScroll.addEventListener('scroll', this._onScroll);
    this._onAnimationFrameRefresh(0);
  }

  stopTracking() {
    if (!this._root) return;

    this._root = null;
    this._afDeferUntil = 0;
    if (this._hScroll) this._hScroll.removeEventListener('scroll', this._onScroll);
    if (this._vScroll) this._hvcroll.removeEventListener('scroll', this._onScroll);
    window.cancelAnimationFrame(this._onAnimationFrameRefresh);
  }

  _getOffsets() {
    const node = document.getElementById(this._id);
    const rect = (this._type === 'focus') ? getCaretAtTextNodePosition(node.firstChild, this._offset, this._wrapped) : node.getBoundingClientRect();
    const rootRect = getContentRect(this._root);
    return {left: rect.left - rootRect.left, top: rect.top - rootRect.top};
  }

  trackFocus(focusId, focusOffset, focusWrapped) {
    // explicitly set attention to track focus
    this._type = 'focus';
    this._id = focusId;
    this._offset = focusOffset;
    this._wrapped = focusWrapped;
    const {left, top} = this._getOffsets();
    this._left = left;
    this._top = top;
  }

  restoreAttentionToFocus() {
    const node = document.getElementById(this._id);
    if (!node) return this.trackFirstVisibleElement();
    this.restoreAttention();
  }

  restoreAttention() {
    const {left, top} = this._getOffsets();
    if (this._hScroll && left !== this._left) this._hScroll.scrollLeft += left - this._left;
    if (this._vScroll && top !== this._top) this._hScroll.scrollTop += top - this._top;
    if (left !== this._left || top !== this._top) {
      const info = this._getOffsets();
      this._left = info.left;
      this._top = info.top;
    }
  }

  trackFirstVisibleElement() {
    if (!this._root) return;

    const root = this._root;
    const rect = getContentRect(root);
    const whatToShow = NodeFilter.SHOW_ELEMENT;
    let found = false;
    const acceptNode = node => {
      if (found) return NodeFilter.FILTER_REJECT;
      found = node.id && intersects(rect, node.getBoundingClientRect());
      return found ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    };
    const filter = {acceptNode};
    const treeWalker = document.createTreeWalker(root, whatToShow, filter);
    const node = treeWalker.nextNode();
    if (!node) return;

    this._type = 'visibleElement';
    this._id = node.id;
    const {left, top} = this._getOffsets();
    this._left = left;
    this._top = top;
  }

  restoreAttentionToElement() {
    const node = document.getElementById(this._id);
    if (!node) return;
    this.restoreAttention();
  }

  onAnimationFrameRefresh() {
    if (this._root && this._type === 'focus') {
      this.restoreAttentionToFocus();
    }
    if (this._root && this._type === 'visibleElement') {
      this.restoreAttentionToElement();
    }
  }
};
