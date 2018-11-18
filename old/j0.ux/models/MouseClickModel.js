'use strict';

const Now = () => Date.now();

export default function ({now=Now, timeWindow=500}) {
  return class MouseClickModel {
    constructor(emit, event) {
      const count = 1, time = now();
      this._start = {event, count, time};
      this._current = {event, count, time};
      this._active = true;
      this._emit = reason => emit(reason, this._start, this._current);
      this._emit('click-start');
    }

    mouseUp(event) {
      this._active = false;
      this._current = {event, count: this._current.count, time: now()};
      this._emit('click', this._start, this._current);
      this.move();
    }

    mouseDown(event) {
      this._active = true;
      this._current = {event, count: this._current.count + 1, time: now()};
      this._emit('click-start');
    }

    move() {
      if (!this._active && now() > this._start.time + timeWindow) this._emit('click-end');
    }

    cancel() { this._emit('click-cancel'); }
  }
};
