'use strict';

const NoDelay = cb => (cb() && null);
const NoCancel = () => true;
const MinimumMovementDelta = 5;

export default function ({type, delay=NoDelay, cancel=NoCancel, minimumDelta=MinimumMovementDelta}) {
  // valid values for type are 'drag' and 'selection'

  return class MouseDragSelectionModel {
    constructor(emit, x, y, event) {
      // constructor is expected to be called when movement tracking is started
      this._start = {x, y, event};
      this._current = {x, y, event};
      this._lastNotified = this._current;

      // started is set whenever 'start' event fires
      this._started = false;
      this._pending = delay(() => this._notify());

      // emit emits type-reason events (like drag-start, selection-start)
      this._emit = reason => {
        if (emit(`${type}-${reason}`, this._start, this._current) === false) {
          // if emit returns false, we treat it like a cancel.  Similart to DOM dispatchEvent
          this.cancel();
        }
      }
    }

    move(x, y, event) {
      // movement detected
      this._current = {x, y, event};
      if (this._pending === null && this._movedTooFar()) {
        this._pending = delay(() => this._notify());
      }
    }

    finish() { this._end('end'); }
    cancel() { this._end('cancel'); }

    _end(reason) {
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
