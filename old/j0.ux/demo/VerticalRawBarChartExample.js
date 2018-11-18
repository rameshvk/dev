'use strict';

require('./RawBarChartExample.less');
const React = require('react');
const ReactDOM = require('react-dom');

import RawBarChart from '../RawBarChart.js';
import renderExample from './renderExample.js';

export default class VerticalRawBarChartExample extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      model: {
        mapBar: handler => {
          const dummyData = [
            {id: 'a', isHorizontal: false, start:0, end:5, value:70, className: 'fill-red'},
            {id: 'b', isHorizontal: false, start:6, end:10, value:22, className: 'fill-blue'},
            {id: 'c', isHorizontal: false, start:21, end:25, value:10, className: 'fill-green'},
            {id: 'd', isHorizontal: false, start:16, end:20, value:45, className: 'fill-red'},
            {id: 'e', isHorizontal: false, start:11, end:14, value:5, className: 'fill-green'}
          ];
          return dummyData.map(handler);
        },
        onMouseEnter: info => this.setState({tooltipInfo: this._calculateTooltipInfo(info)}),
        onMouseLeave: info => {
          if (info.id === (this.state.tooltipInfo || {}).id) {
            this.setState({tooltipInfo: null});
          }
        }
      },
      tooltipInfo: null
    };
  }

  _calculateTooltipInfo(info) {
    const ownNode = ReactDOM.findDOMNode(this.refs.example);
    const rect = ownNode.getBoundingClientRect();
    return {
      id: info.id,
      top: info.y - rect.top,
      left: info.x - rect.left,
      text: 'Tooltip: ' + info.id
    };
  }

  _renderTooltip() {
    if (!this.state.tooltipInfo) return null;

    return React.DOM.div(
      {
        style: {
          position: 'absolute',
          top: this.state.tooltipInfo.top - 25,
          left: this.state.tooltipInfo.left,
          width: '100px',
          marginLeft: '-50px',
          background: 'white',
          outline: '1px solid gray',
          textAlign: 'center'
        }
      },
      this.state.tooltipInfo.text
    );
  }

  _renderExample() {
    return React.DOM.div(
      {style: {position: 'relative'}, ref: 'example'},
      React.createElement(
        RawBarChart,
        {model: this.state.model, width: 1200, height: 400, style: {height: '200px'}}
      ),
      this._renderTooltip()
    );
  }

  render() {
    return renderExample({
      title: 'RawBarChart (vertical)',
      oneLiner: 'implements the raw bar charts plus tooltips',
      details: React.DOM.div(
        null,
        'This quick example below illustrates rendering a vertical bar chart and also includes some minimal tooltip support on hover over the bars.'
      ),
      example: this._renderExample()
    });
  }
};
