'use strict';

require('./GetNearestRectForPointDemo.less');
import BaseComponent from '../ux/BaseComponent.js';
import React from 'react';
import ReactDOM from 'react-dom';
import Demo from './Demo';
import DemoDescription from './DemoDescription.js';
import Movable from '../ux/Movable.js';
import MovableModel from '../ux/models/MovableModel.js';
import getNearestRectForPoint from '../shape/rect/getNearestRectForPoint';
import getRandomColor from './getRandomColor.js';

export default class GetNearestRectForPointDemo extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {selected: null};
    this._movableModels = [0, 1, 2, 3, 4, 5, 6].map(index => new MovableModel({x: 10 * index, y: 0}));
    this._onClick = ee => this.onClick(ee);
  }

  onClick(ee) {
    const ownNode = ReactDOM.findDOMNode(this);
    const nodes = ownNode.querySelectorAll('.rect');
    let rects = [];
    for (let kk = 0, node = nodes[kk]; kk < nodes.length; kk ++, node = nodes[kk]) {
      rects.push(node.getBoundingClientRect());
    }
    const point = {x: ee.clientX, y: ee.clientY};
    this.setState({
      selected: rects.indexOf(getNearestRectForPoint(rects, point))
    });
  }

  renderRect(model, index) {
    const className = 'rect' + (this.state.selected === index ? ' selected' : '');
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

  render() {
    return Demo.create(
      {title: 'Function shape.rect.getNearestRectForPoint'},
      React.DOM.div(
        {onClick: this._onClick},
        DemoDescription.create(
          {},
          'Finds the nearest Rect from a given Point.  ',
          'If the point is within multiple rects, the first such rect is returned.  ',
          'If the point is not within a rect but the y-coordinate is between top-bottom, then only similar such rects are considered and the chosen rect has the least X-distance from the point.  ',
          'In all other cases, the smallest Y-distance is chosen.  '
        ),
        DemoDescription.create(
          {},
          'Drag the rectangles to position them. And then click at a point.  ',
          'The demo will use the getNearestRectForPoint function to figure out the closest Rect.'
        ),
        React.DOM.div(
          {style: {padding: 10, minHeight: 200}},
          this._movableModels.map((model, index) => this.renderRect(model, index))
        )
      )
    );
  }
};
