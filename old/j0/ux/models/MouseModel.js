'use strict';

import MouseMovementModel from './MouseMovementModel.js';
import MouseHoverModel from './MouseHoverModel.js';
import MouseClickModel from './MouseClickModel.js';

export default function({now, delay, cancel, timeWindow, minimumDelta}) {
  const DragModel = MouseMovementModel({type: 'drag', delay, cancel, minimumDelta});
  const SelectionModel = MouseMovementModel({type: 'selection', delay, cancel, minimumDelta});
  const HoverModel = MouseHoverModel({delay, cancel, minimumDelta});
  const ClickModel = MouseClickModel({now, timeWindow});

  const EscapeKeyCode = 27;
  return class MouseModel {
    constructor({emit, isSelectable=false}) {
      this._isSelectable = !!isSelectable;
      this._drag = null;
      this._selection = null;
      this._hover = null;
      this._click = null;
      this._emit = (type, start, current) => {
        const wasInactive = this._isInactive();

        // A drag or selection start effectively cancels any pending clicks.
        if (this._click && (type === 'drag-start' || type === 'selection-start')) {
          this._click.cancel();
        }

        this._resetModels(type);
        // do not emit abort messages, they are just internal
        if (type.indexOf('abort') === -1) emit(type, start, current);

        const isInactive = this._isInactive();
        if (!wasInactive && isInactive) {
          // nothing left?  signal cleanup
          emit('clear-listeners');
        }
      };
    }

    _isInactive() {
      return [this._drag, this._selection, this._hover, this._click].filter(x => x).length === 0;
    }

    setSelectable(isSelectable) {
      if (this._isSelectable === !!isSelectable) return;

      if (this._drag || this._selection) {
        throw new Error('changing isSelectable is not allowed when drag or selection are in progress');
      }
      this._isSelectable = !!isSelectable;
      return this;
    }

    onMouseDown(ee) {
      // Only handle left clicks for now.
      if (ee.button !== 0) return {};

      // Mouse down effectively cancels drag and selection.  Unclear how this can happen.
      this.cancel([this._drag, this._selection, this._hover]);

      // Start selection or drag.
      if (this._isSelectable) {
        this._selection = new SelectionModel(this._emit, ee.clientX, ee.clientY, ee);
      } else {
        this._drag = new DragModel(this._emit, ee.clientX, ee.clientY, ee);
      }

      // If there is a click handler, pass the event through to it.  Else start one
      if (this._click) {
        this._click.mouseDown(ee);
      } else {
        this._click = new ClickModel(this._emit, ee);
      }

      return {
        mouseup: ee => this.onDocumentMouseUp(ee),
        mousemove: ee => this.onDocumentMouseMove(ee),
        keydown: ee => this.onDocumentKeyDown(ee)
      }
    }

    onDocumentMouseUp(ee) {
      if (ee.button !== 0) return;
      this.finish([this._drag, this._selection, this._hover]);
      if (this._click) this._click.mouseUp(ee);
    }

    onMouseEnter(ee) {
      if (this._hover) this._hover.cancel();
      this._hover = new HoverModel(this._emit, ee.clientX, ee.clientY, ee);
    }

    onMouseLeave(ee) {
      if (this._hover) this._hover.finish();
      if (this._click) this._click.cancel();
    }

    onDocumentMouseMove(ee) {
      if (this._drag) this._drag.move(ee.clientX, ee.clientY, ee);
      if (this._selection) this._selection.move(ee.clientX, ee.clientY, ee);
      if (this._hover) this._hover.move(ee.clientX, ee.clientY, ee);
      if (this._click) this._click.move();
    }

    onDocumentKeyDown(ee) { this.onKeyDown(ee); }
    onKeyDown(ee) {
      if (ee.keyCode !== EscapeKeyCode) return;
      ee.stopPropagation();
      ee.preventDefault();
      this.cancel();
    }

    _resetModels(type) {
      // when drag/selection/hover/clicks end, clean up their states.
      switch (type) {
      case 'drag-cancel': case 'drag-end': case 'drag-abort':
        this._drag = null; break;
      case 'selection-cancel': case 'selection-end': case 'selection-abort':
        this._selection = null; break;
      case 'hover-cancel': case 'hover-end': case 'hover-abort':
        this._hover = null; break;
      case 'click-cancel': case 'click-end': case 'click-abort':
        this._click = null; break;
      }
    }

    cancel(models) {
      (models || [this._drag, this._selection, this._hover, this._click]).forEach(model => (model && model.cancel()));
    }

    finish(models) {
      (models || [this._drag, this._selection, this._hover, this._click]).forEach(model => (model && model.finish()));
    }
  };
};
