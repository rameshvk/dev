'use strict';

import {EventEmitter} from 'events';

export default class SelectorModel extends EventEmitter {
  constructor(initialOptionIndex) {
    super();
    this._optionIndex = initialOptionIndex || 0;
  }

  next() {
    this._optionIndex ++;
    super.emit('change');
  }

  prev() {
    this._optionIndex --;
    super.emit('change');
  }

  select(index) {
    this._optionIndex = index;
    super.emit('change');
  }

  get(maxCount) {
    while (this._optionIndex < 0) this._optionIndex += maxCount;
    return this._optionIndex % maxCount;
  }
};
