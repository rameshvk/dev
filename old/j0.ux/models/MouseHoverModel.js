'use strict';

const NoDelay = cb => (cb() && null);
const NoCancel = () => true;
const MinimumMovementDelta = 5;

export default function ({delay=NoDelay, cancel=NoCancel, minimumDelta=MinimumMovementDelta}) {
  return class MouseHoverModel {
    constructor(emit, x, y, event) {
      // constructor is expected to be called when movement tracking is started
      this._start = {x, y, event};
      this._current = {x, y, event};
      this._lastNotified = this._current;

      // started is set to true after every emit('start')
      this._started = true;
      this._pending = null;

      // emit emits hover-start, hover-end events
      this._emit = reason => {
        if (emit(`hover-${reason}`, this._start, this._current) === false) {
          // if emit returns false, we treat it like a cancel.  Similart to DOM dispatchEvent
          this.cancel();
        }
      }
      this._emit('start');
    }

    move(x, y, event) {
      // called on every move.
      this._current = {x, y, event};
      if (this._pending === null && this._movedTooFar()) {
        this._pending = delay(() => this._notify());
      }
    }

    finish() { this._end('end'); }
    cancel() { this._end('cancel'); }

    _end(reason = 'end') {
      if (this._pending) cancel(this._pending);
      this._pending = null;
      this._emit(this._started ? reason : 'abort');
    }

    _notify() {
      this._pending = null;
      if (!this._movedTooFar()) return;
      this._lastNotified = this._current;

      this._emit(this._started ? 'move' : 'start');
      this._started = true;
    }

    _movedTooFar() {
      return minimumDelta < Math.abs(this._lastNotified.x - this._current.x) + Math.abs(this._lastNotified.y - this._current.y);
    }
  }
};
