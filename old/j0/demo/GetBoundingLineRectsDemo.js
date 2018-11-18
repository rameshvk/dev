'use strict';

require('./GetBoundingLineRectsDemo.less');

import BaseComponent from '../ux/BaseComponent.js';
import React from 'react';
import ReactDOM from 'react-dom';
import Demo from './Demo';
import DemoDescription from './DemoDescription.js';
import Movable from '../ux/Movable.js';
import MovableModel from '../ux/models/MovableModel.js';
import getBoundingLineRects from '../shape/rect/getBoundingLineRects.js';
import getRandomColor from './getRandomColor.js';

function shiftRect({top, bottom, left, right}, shiftLeft, shiftTop) {
  return {top: top - shiftTop, bottom: bottom - shiftTop, left: left - shiftLeft, right: right - shiftLeft};
}

export default class GetNearestRectForPointDemo extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {lineRects: null};
    this._movableModels = [0, 1, 2, 3, 4, 5, 6].map(index => new MovableModel({x: 10 * index, y: 0}));
    this._movableModels.forEach(model => model.on('change', () => this.onChange()));
  }

  componentDidMount() {
    this.onChange();
  }

  onChange() {
    window.requestAnimationFrame(() => {
      const baseNode = ReactDOM.findDOMNode(this.refs.base);
      if (!baseNode) return;

      const ownNode = ReactDOM.findDOMNode(this);
      const nodes = ownNode.querySelectorAll('.bounding-rect');
      let rects = [];
      for (let kk = 0, node = nodes[kk]; kk < nodes.length; kk ++, node = nodes[kk]) {
        rects.push(node.getBoundingClientRect());
      }

      const baseNodeRect = baseNode.getBoundingClientRect();
      const left = baseNodeRect.left, top = baseNodeRect.top;
      this.setState({
        lineRects: getBoundingLineRects(rects, {}).map(rect => shiftRect(rect, left, top))
      });
    });
  }

  renderRect(model, index) {
    const className = 'bounding-rect' + (this.state.selected === index ? ' selected' : '');
    const key = `rect${index}`;
    const id = `rect${index}`;
    const style = {width: '100%', height: '100%', background: getRandomColor(index)};
    return Movable.create(
      {key, model},
      React.DOM.div(
        {id, className},
        React.DOM.div({style})
      )
    );
  }

  renderLineRect(rect, index) {
    const width = rect.right - rect.left, height = rect.bottom - rect.top;
    const style = {top: rect.top, left: rect.left, width, height};
    const key = `key${index}`;
    return React.DOM.div({className: 'line-rect', style, key});
  }

  renderLineRects() {
    if (!this.state.lineRects) return null;
    return this.state.lineRects.map(this.renderLineRect);
  }

  render() {
    return Demo.create(
      {title: 'Function shape.rect.getBoundingLineRects'},
      React.DOM.div(
        {onClick: this._onClick, ref: 'base', className: 'demo-bounding-rect'},
        DemoDescription.create(
          {},
          'Given a sequence of rects that represents text nodes that may have wrapped,',
          'this function finds the equivalent rects that would represent each line.'
        ),
        DemoDescription.create(
          {},
          'Drag the rectangles to position them.  ',
          'The demo will render the resultant rects as an overlay.'
        ),
        React.DOM.div(
          {style: {padding: 10, minHeight: 200}},
          this._movableModels.map((model, index) => this.renderRect(model, index))
        ),
        this.renderLineRects()
      )
    );
  }
};
