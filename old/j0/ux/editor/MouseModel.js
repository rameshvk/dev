'use strict';

import TextSelection from './TextSelection.js';
import getTextNodeInfoForPoint from '../../dom/getTextNodeInfoForPoint';
import {toViewportCoordinates, toDocumentCoordinates} from '../../dom/coordinates';

export default class MouseModel {
  constructor(selection, root) {
    this._selection = selection;
    this._root = root;

    this._hasMoved = false;
    this._cursor = null;
    this._start = null;

    this._onDocumentMouseMove = ee => this.onDocumentMouseMove(ee);
    this._onDocumentMouseUp = ee => this.onDocumentMouseUp(ee);
    this._afPending = null;
    this._onAnimationRefresh = ts => {
      this._afPending = window.requestAnimationFrame(this._onAnimationRefresh);
      this.onAnimationRefresh(ts);
    };
  }

  cleanup() {
    document.removeEventListener('mousemove', this._onDocumentMouseMove);
    document.removeEventListener('mouseup', this._onDocumentMouseUp);
    window.cancelAnimationFrame(this._afPending);
    this._hasMoved = false;
    this._cursor = null;

    // start is not cleared but maintained between clicks.
    // this._start = null;
  }

  onMouseDown(ee) {
    const point = {x: ee.clientX, y: ee.clientY}; // document coordinates, due to React
    const info = getTextNodeInfoForPoint(this._root, point, '.j0text');
    if (!info) return 0;

    const clickCount = this._updateStartInfoForClick(point, info);
    document.addEventListener('mousemove', this._onDocumentMouseMove);
    document.addEventListener('mouseup', this._onDocumentMouseUp);
    this._onAnimationRefresh(this._start.time);
    this._selection.onClick(clickCount, info);
    if (clickCount > 1) {
      this._start.snapshot = new TextSelection(this._selection);
    }
    return clickCount;
  }

  _isMultiClick(now) {
    return this._start && this._isCloseBy(this._cursor, this._start.cursor) && now - this._start.time < MouseModel.ClickInterval;
  }

  _updateStartInfoForClick(point, info) {
    const now = performance.now();
    this._cursor = toViewportCoordinates(point);
    if (this._isMultiClick(now)) {
      this._start = {cursor: this._start.cursor, time: now, clickCount: this._start.clickCount + 1, snapshot: null};
    } else {
      this._start = {cursor: this._cursor, time: now, clickCount: 1, snapshot: null};
    }
    return this._start.clickCount;
  }

  onDocumentMouseMove(ee) {
    // viewport coordinates: document events are not normalized by React
    this._cursor = {x: ee.clientX, y: ee.clientY};
  }

  onAnimationRefresh(now) {
    if (!this._cursor) return;
    this._hasMoved = this._hasMoved || !this._isCloseBy(this._cursor, this._start.cursor);
    if (this._hasMoved) this._updateSelection();
  }

  onDocumentMouseUp(ee) {
    // once there is a move, reset the clickCount
    if (this._hasMoved) {
      this._start.clickCount = 0;
      this._start.selection = null;
    }
    this.cleanup();
  }

  _isCloseBy(point1, point2) {
    const xDelta = point1.x - point2.x;
    const yDelta = point2.y - point2.y;
    return Math.abs(xDelta) + Math.abs(yDelta) <= MouseModel.MoveDelta;
  }

  _updateSelection() {
    const endPoint = toDocumentCoordinates(this._cursor);
    const endInfo = getTextNodeInfoForPoint(this._root, endPoint, '.j0text');
    if (endInfo) {
      if (this._start.snapshot) {
        this._selection.copyFrom(this._start.snapshot).clickExtend(endInfo);
      } else {
        this._selection.extendFocus(endInfo);
      }
    }
  }
}

MouseModel.ClickInterval = 500;
MouseModel.MoveDelta = 5;
