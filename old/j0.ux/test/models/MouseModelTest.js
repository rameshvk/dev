'use strict';

const assert = require('assert');
import MouseModel from '../../models/MouseModel.js';

describe('Mouse Model', () => {
  let emits, model, delays, timeWindow, delta, time;

  function flushDelay() {
    for (let ii = 0; ii < delays.length; ii ++) {
      if (delays[ii].isActive) delays[ii].cb();
    }
  }

  function createFakeEvent({x, y, button, keyCode}) {
    return Object.freeze({
      clientX: x,
      clientY: y,
      keyCode: keyCode,
      button: button,
      stopPropagation: () => true,
      preventDefault: () => true
    });
  }

  beforeEach(() => {
    const emit = (type, start, current) => emits.push({type, start, current});
    const now = () => time;
    const delay = cb => delays.push({isActive: true, cb: cb});
    const cancel = index => delays[index - 1].isActive = false;
    const notifyImmediately = false;
    const isSelectable = false;

    timeWindow = 15;
    time = 1;
    delta = 10;
    emits = [];
    delays = [];

    const Model = MouseModel({now, delay, cancel, timeWindow, minimumDelta:delta});
    model = new Model({emit, isSelectable});
  });

  it('ignores non-left buttons on mouse down', () => {
    const downEvent = createFakeEvent({x: 0, y: 0, button: 1});
    assert.deepEqual(model.onMouseDown(downEvent), {});
    assert.deepEqual(emits, []);
  });

  describe('Clicking', () => {
    beforeEach(() => {
      // first mouse down behavior
      const listeners = model.onMouseDown(createFakeEvent({x: 0, y: 0, button: 0}));
      assert.ok(listeners);
      assert.deepEqual(Object.keys(listeners).sort(), ['keydown', 'mousemove', 'mouseup']);
      assert.deepEqual(emits.map(ee => ee.type), ['click-start']);
    });

    it('detects a simple click', () => {
      // mouse up behavior
      model.onDocumentMouseUp(createFakeEvent({x: 0, y: 0, button: 0}));
      assert.deepEqual(emits.map(ee => ee.type), ['click-start', 'click']);

      // a double click is still possible, so move clock forward and move mouse
      time += timeWindow + 1;
      model.onDocumentMouseMove(createFakeEvent({x: 0, y: 0, button: 0}));
      flushDelay();
      assert.deepEqual(emits.map(ee => ee.type), ['click-start', 'click', 'click-end', 'clear-listeners']);
    });

    it('times out after a slow click', () => {
      // move time forward over the threshold
      time += timeWindow + 1;

      // mouse up behavior
      model.onDocumentMouseUp(createFakeEvent({x: 0, y: 0, button: 0}));
      assert.deepEqual(emits.map(ee => ee.type), ['click-start', 'click', 'click-end', 'clear-listeners']);
    });

    it('cancels initial click on abort', () => {
      model.cancel();
      assert.deepEqual(emits.map(ee => ee.type), ['click-start', 'click-cancel', 'clear-listeners']);
    });

    it('cancels initial click on escape key', () => {
      // escape
      const escape = createFakeEvent({keyCode: 27});
      model.onDocumentKeyDown(escape);
      assert.deepEqual(emits.map(ee => ee.type), ['click-start', 'click-cancel', 'clear-listeners']);
    });

    it('cancels initial click on mouseLeave', () => {
      // mouse leaving
      model.onMouseLeave(createFakeEvent({}))

      // drag may still kick off, so no 'clear-listeners'
      assert.deepEqual(emits.map(ee => ee.type), ['click-start', 'click-cancel']);
    });

    it('detects click within delta', () => {
      // move a little
      model.onDocumentMouseMove(createFakeEvent({x: delta/2, y: delta/2, button: 0}));
      flushDelay();

      // first mouse up behavior
      model.onDocumentMouseUp(createFakeEvent({x: delta/2, y: delta/2, button: 0}));
      assert.deepEqual(emits.map(ee => ee.type), ['click-start', 'click']);

      // a double click is still possible, so move clock forward and move mouse
      time += timeWindow + 1;
      model.onDocumentMouseMove(createFakeEvent({x: 0, y: 0, button: 0}));
      flushDelay();
      assert.deepEqual(emits.map(ee => ee.type), ['click-start', 'click', 'click-end', 'clear-listeners']);
    });

    it('cancels click after delta and convers to drag', () => {
      // move a lot
      model.onDocumentMouseMove(createFakeEvent({x: 1 + delta/2, y: delta/2, button: 0}));
      flushDelay();
      assert.deepEqual(emits.map(ee => ee.type), ['click-start', 'click-cancel', 'drag-start']);

      // mouse up should not fire click but should finish drag
      model.onDocumentMouseUp(createFakeEvent({x: 1 + delta/2, y: delta/2, button: 0}));
      assert.deepEqual(emits.map(ee => ee.type), ['click-start', 'click-cancel', 'drag-start', 'drag-end', 'clear-listeners']);
    });

    it('detects a double-click', () => {
      // move a little
      time += timeWindow/2;
      model.onDocumentMouseMove(createFakeEvent({x: delta/2, y: delta/2, button: 0}));
      flushDelay();

      // first mouse up behavior
      model.onDocumentMouseUp(createFakeEvent({x: delta/2, y: delta/2, button: 0}));
      assert.deepEqual(emits.map(ee => ee.type), ['click-start', 'click']);
      assert.equal(emits[emits.length - 1].current.count, 1);

      // second mouse down behavior, still within bounds
      time += timeWindow/2;
      model.onMouseDown(createFakeEvent({x: delta, y: 0, button: 0}));
      assert.deepEqual(emits.map(ee => ee.type), ['click-start', 'click', 'click-start']);

      // second mouse up behavior
      model.onDocumentMouseUp(createFakeEvent({x: delta/2, y: delta/2, button: 0}));
      assert.deepEqual(emits.map(ee => ee.type), ['click-start', 'click', 'click-start', 'click']);
      assert.equal(emits[emits.length - 1].current.count, 2);

      // a triple click is still possible, so move clock forward and move mouse
      time += timeWindow + 1;
      model.onDocumentMouseMove(createFakeEvent({x: 0, y: 0, button: 0}));
      flushDelay();
      assert.deepEqual(emits.map(ee => ee.type), ['click-start', 'click', 'click-start', 'click', 'click-end', 'clear-listeners']);
    });
  });

  describe('Dragging', () => {
    beforeEach(function() {
      // first mouse down behavior
      const listeners = model.onMouseDown(createFakeEvent({x: 0, y: 0, button: 0}));
      assert.ok(listeners);
      assert.deepEqual(Object.keys(listeners).sort(), ['keydown', 'mousemove', 'mouseup']);
      assert.deepEqual(emits.map(ee => ee.type), ['click-start']);
    });

    it('completes drag on mouse up', () => {
      // move past delta to start drag
      model.onDocumentMouseMove(createFakeEvent({x: 0, y: 1 + delta, button: 0}));
      flushDelay();
      assert.deepEqual(emits.map(ee => ee.type), ['click-start', 'click-cancel', 'drag-start']);

      // now mouse up and finish drag
      model.onDocumentMouseUp(createFakeEvent({x: 0, y: 1 + delta, button: 0}));
      assert.deepEqual(emits.map(ee => ee.type), ['click-start', 'click-cancel', 'drag-start', 'drag-end', 'clear-listeners']);
    });

    it('does not start drag for small moves', () => {
      // move a little
      model.onDocumentMouseMove(createFakeEvent({x: delta/2, y: delta/2, button: 0}));
      flushDelay();

      assert.deepEqual(emits.map(ee => ee.type), ['click-start']);
    });

    it('detects a drag when moved with mouse-down state', () => {
      // move past delta to start drag
      model.onDocumentMouseMove(createFakeEvent({x: 0, y: 1 + delta, button: 0}));
      flushDelay();

      // expect the click-start to be canceled and the drag start to happen
      assert.deepEqual(emits.map(ee => ee.type), ['click-start', 'click-cancel', 'drag-start']);
    });

    it('delays drag-start, does not fire it immediately', () => {
      // move past delta to start drag
      model.onDocumentMouseMove(createFakeEvent({x: 0, y: 1 + delta, button: 0}));
      assert(delays.length, 1);
      assert.deepEqual(emits.map(ee => ee.type), ['click-start']);
    });

    it('uses absolute positions to calculate delta', () => {
      // move past delta to start drag
      model.onDocumentMouseMove(createFakeEvent({x: - delta/2, y: 1 + delta/2, button: 0}));
      flushDelay();

      // expect the click-start to be canceled and the drag start to happen
      assert.deepEqual(emits.map(ee => ee.type), ['click-start', 'click-cancel', 'drag-start']);
    });

    it('cancels a drag when aborted', () => {
      // move past delta to start drag
      model.onDocumentMouseMove(createFakeEvent({x: 0, y: 1 + delta, button: 0}));
      flushDelay();

      model.cancel();

      // expect the click-start to be canceled and the drag start to happen
      assert.deepEqual(emits.map(ee => ee.type), ['click-start', 'click-cancel', 'drag-start', 'drag-cancel', 'clear-listeners']);
    });

    it('cancels a drag when escape key is pressed', () => {
      // move past delta to start drag
      model.onDocumentMouseMove(createFakeEvent({x: 0, y: 1 + delta, button: 0}));
      flushDelay();

      // escape
      const escape = createFakeEvent({keyCode: 27});
      model.onDocumentKeyDown(escape);
      assert.deepEqual(emits.map(ee => ee.type), ['click-start', 'click-cancel', 'drag-start', 'drag-cancel', 'clear-listeners']);
    });
  });

  describe('Selecting', () => {
    beforeEach(function() {
      // first set state to be selectable
      model.setSelectable(true);

      // now start mouse-down
      const listeners = model.onMouseDown(createFakeEvent({x: 0, y: 0, button: 0}));
      assert.ok(listeners);
      assert.deepEqual(Object.keys(listeners).sort(), ['keydown', 'mousemove', 'mouseup']);
      assert.deepEqual(emits.map(ee => ee.type), ['click-start']);
    });

    it('completes drag on mouse up', () => {
      // move past delta to start selection
      model.onDocumentMouseMove(createFakeEvent({x: 0, y: 1 + delta, button: 0}));
      flushDelay();
      assert.deepEqual(emits.map(ee => ee.type), ['click-start', 'click-cancel', 'selection-start']);

      // now mouse up and finish selection
      model.onDocumentMouseUp(createFakeEvent({x: 0, y: 1 + delta, button: 0}));
      assert.deepEqual(emits.map(ee => ee.type), ['click-start', 'click-cancel', 'selection-start', 'selection-end', 'clear-listeners']);
    });
  });

  describe('Hover', () => {
    beforeEach(function() {
      // now start hover with mouse enter
      model.onMouseEnter(createFakeEvent({x: 0, y: 0, button: 0}));
      assert.deepEqual(emits.map(ee => ee.type), ['hover-start']);
    });

    it('ends hover on mouseleave', () => {
      model.onMouseLeave(createFakeEvent({x: 0, y: 0, button: 0}));
      assert.deepEqual(emits.map(ee => ee.type), ['hover-start', 'hover-end', 'clear-listeners']);
    });

    it('cancels hover on mousedown', () => {
      model.onMouseDown(createFakeEvent({x: 0, y: 0, button: 0}));
      assert.deepEqual(emits.map(ee => ee.type), ['hover-start', 'hover-cancel', 'clear-listeners', 'click-start']);
    });

    it('cancels hover on escape', () => {
      const escape = createFakeEvent({keyCode: 27});
      model.onDocumentKeyDown(escape);
      assert.deepEqual(emits.map(ee => ee.type), ['hover-start', 'hover-cancel', 'clear-listeners']);
    });

    it('cancels hover on aborting', () => {
      model.cancel();
      assert.deepEqual(emits.map(ee => ee.type), ['hover-start', 'hover-cancel', 'clear-listeners']);
    });
  });
});
