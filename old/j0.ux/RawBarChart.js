'use strict';

const React = require('react');
const ReactDOM = require('react-dom');

import PureRenderComponent from './PureRenderComponent.js';
import getAncestorAttribute from './getAncestorAttribute.js';

const RawBarChartPropTypes = {
  width: React.PropTypes.number.isRequired,
  height: React.PropTypes.number.isRequired,
  style: React.PropTypes.object,
  model: React.PropTypes.object.isRequired
};

// TODO: implement mouse tracking like for Movable
export default class RawBarChart extends PureRenderComponent {
  constructor(props) {
    super(props);
    this._onMouseEnter = ee => this.props.model.onMouseEnter(this._getMouseDetails(ee));
    this._onMouseLeave = ee => this.props.model.onMouseLeave(this._getMouseDetails(ee));
  }

  _getMouseDetails(ee) {
    const node = getAncestorAttribute(ee.target, 'data-id', ReactDOM.findDOMNode(this));
    const id = node && node.getAttribute('data-id');
    return {id, x: ee.clientX, y: ee.clientY};
  }

  _renderBar({id, isHorizontal, start, end, value, className}) {
    const chartWidth = this.props.width, chartHeight = this.props.height;
    const key = id, diff = end - start;
    const onMouseEnter = this._onMouseEnter, onMouseLeave = this._onMouseLeave;
    const onMouseOver = this._onMouseOver;

    const width = (isHorizontal ? value : diff) * chartWidth / 100;
    const height = (isHorizontal ? diff : value) * chartHeight / 100;
    const xOffset = isHorizontal ? 0 : (start * chartWidth / 100);
    const yOffset = isHorizontal ? start * chartHeight / 100 : (chartHeight - height);
    const transform = `translate(${xOffset}, ${yOffset})`;

    return React.DOM.g(
      {key, className, transform, onMouseEnter, onMouseLeave, onMouseOver, 'data-id':id},
      React.DOM.rect({width, height})
    );
  }

  render() {
    const viewBox = `0 0 ${this.props.width} ${this.props.height}`;
    return React.DOM.svg(
      {viewBox, style: this.props.style},
      this.props.model.mapBar(bar => this._renderBar(bar))
    );
  }
};

RawBarChart.propTypes = RawBarChartPropTypes;
