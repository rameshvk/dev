'use strict';

const React = require('react');
import MovableModel from './MovableModel.js';
import PureRenderComponent from './PureRenderComponent.js';

const EscapeKeyCode = 27;
const MovablePropTypes = {
  model: React.PropTypes.instanceOf(MovableModel).isRequired
};

export default class Movable extends PureRenderComponent {
  constructor(props) {
    super(props);
    this.state = {};
    this.mouseListeners = {
      mousedown: ee => this.onMouseDownCapture(ee),
      mouseup: ee => this.onMouseUpCapture(ee),
      mousemove: ee => this.props.model.move(ee.clientX, ee.clientY),
      keydown: ee => this.onKeyDownCapture(ee)
    };
  }

  componentWillUnmount() {
    this.endMove(true);
  }

  onMouseDown(ee) {
    if (ee.button !== 0) return;
    ee.preventDefault();
    ee.stopPropagation();
  }

  onMouseDownCapture(ee) {
    if (ee.button !== 0) return;
    for (const event in this.mouseListeners) {
      if (event === 'mousedown') continue;
      document.addEventListener(event, this.mouseListeners[event], true);
    }

    this.props.model.startMove(ee.clientX, ee.clientY);
  }

  onMouseUpCapture(ee) {
    if (ee.button === 0) this.endMove(false);
  }

  onKeyDownCapture(ee) {
    if (ee.keyCode === EscapeKeyCode) this.endMove(true);
  }

  endMove(cancelMove) {
    this.props.model.endMove(cancelMove);
    for (const event in this.mouseListeners) {
      document.removeEventListener(event, this.mouseListeners[event]);
    }
  }

  render() {
    return React.DOM.span(
      {onMouseDownCapture: this.mouseListeners.mousedown, onMouseDown: this.onMouseDown},
      this.props.children
    );
  }
};

Movable.propTypes = MovablePropTypes;
Movable.createModel = () => {
  return new MovableModel(requestAnimationFrame.bind(window), cancelAnimationFrame.bind(window));
};
