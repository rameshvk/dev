'use strict';

import {EventEmitter} from 'events';
import MouseModelCreator from './MouseModel.js';

const now = () => Date.now();
const delay = (fn, time) => setTimeout(fn, time);
const cancel = handle => clearTimeout(handle);
const timeWindow = 200;
const minimumDelta = 5;
const MouseModel = new MouseModelCreator({now, delay, cancel, timeWindow, minimumDelta});

export default class MovableModel extends EventEmitter {
  constructor({x, y}) {
    super();
    this._start = {x, y};
    this._current = {x: 0, y: 0};
    const emit = (type, start, current) => super.emit(type, start, current);
    this._mouseModel = new MouseModel({emit});
    this._listeners = {};
    this.on('clear-listeners', () => this._clearListeners());
    this.on('drag-move', (start, current) => this._onDragMove(start, current));
    this.on('drag-cancel', () => this._onDragCancel());
    this.on('drag-end', (start, current) => this._onDragEnd(start, current));
  }

  onMouseDown(ee) {
    const events = this._mouseModel.onMouseDown(ee);
    for (let event in events) {
      if (!this._listeners[event]) {
        this._listeners[event] = events[event];
        document.addEventListener(event, events[event]);
      }
    }
  }

  getPosition() {
    return {x: this._start.x + this._current.x, y: this._start.y + this._current.y};
  }

  setPosition({x, y}) {
    const {currentX, currentY} = this.getPosition();
    this._start = {x: x - currentX, y: y - currentY};
  }

  cancel() {
    this._mouseModel.cancel();
    this._clearListeners();
    super.removeAllListeners();
  }

  _onDragMove(start, current) {
    this._current = {x: current.x - start.x, y: current.y - start.y};
    super.emit('change');
  }

  _onDragCancel() {
    this._current = {x: 0, y:0};
    super.emit('change');
    super.emit('cancel');
  }

  _onDragEnd(start, current) {
    this._start = this.getPosition();
    this._current = {x: 0, y: 0};
    super.emit('submit');
  }

  _clearListeners() {
    for (let event in this._listeners) {
      document.removeEventListener(event, this._listeners[event]);
    }
    this._listeners = {};
  }
};
