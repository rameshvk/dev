'use strict';
const EventEmitter = require('events').EventEmitter;

const NoDelay = cb => cb();
const NoCancel = () => true;

export default class MovableModel extends EventEmitter {
  constructor(delay = NoDelay, cancel = NoCancel, minimumDelta = 5) {
    super();
    this._delay = delay;
    this._cancel = cancel;
    this._minimumDelta = minimumDelta;

    this._lastNotified = null;
    this._start = null;
    this._current = null;
    this._notifiedStart = false;
    this._pending = null;
  }

  startMove(x, y) {
    this._start = this._start || {x, y};
    this._current = {x, y};
    return this;
  }

  move(x, y) {
    if (!this._start) return;
    this._current = {x, y};
    if (this._notifiedStart || this._movedTooFar()) {
      if (this._pending !== null) this._cancel(this._pending);
      this._pending = this._delay(() => this._notifyStateChange());
    }
    return this;
  }

  endMove(cancelMove) {
    if (this._notifiedStart) {
      this.emit(cancelMove ? 'move-cancel' : 'move-end', this._start, this._current);
    }
    this._notifiedStart = false;
    this._lastNotified = this._start = this._current = null;
    if (this._pending !== null) this._cancel(this._pending);
    this._pending = null;
  }

  _notifyStateChange() {
    this._pending = null;
    if (this._notifiedStart) {
      if (this._lastNotified !== this._current) {
        this._lastNotified = this._current;
        return this.emit('move', this._start, this._current);
      }
    } else if (this._start && this._movedTooFar()) {
      this._notifiedStart = true;
      this._lastNotified = this._current;
      return this.emit('move-start', this._start, this._current);
    }
  }

  _movedTooFar() {
    const start = this._start, current = this._current;
    return this._minimumDelta < Math.abs(start.x - current.x) + Math.abs(start.y - current.y);
  }
};

module.exports = MovableModel;
