'use strict';

const React = require('react');
const ReactDOM = require('react-dom');

import PureRenderComponent from './PureRenderComponent.js';
import getAncestorAttribute from './getAncestorAttribute.js';

const RawLineChartPropTypes = {
  width: React.PropTypes.number.isRequired,
  height: React.PropTypes.number.isRequired,
  lineClassName: React.PropTypes.string,
  style: React.PropTypes.object,
  model: React.PropTypes.object.isRequired
};

export default class RawLineChart extends PureRenderComponent {
  _getPointDetails({id, isHorizontal, domain, value}) {
    const chartWidth = this.props.width, chartHeight = this.props.height;
    const xOffset = (isHorizontal ? value : domain) * chartWidth / 100;
    const yOffset = (isHorizontal ? domain : 100 - value) * chartHeight / 100;
    return `${xOffset},${yOffset}`;
  }

  render() {
    const viewBox = `0 0 ${this.props.width} ${this.props.height}`;
    return React.DOM.svg(
      {viewBox, style: this.props.style},
      React.DOM.polyline({
        className: this.props.lineClassName,
        fill: 'none',
        points: this.props.model.mapPoint(point => this._getPointDetails(point)).join(' ')
      })
    );
  }
};

RawLineChart.propTypes = RawLineChartPropTypes;
