'use strict';

require('./RawLineChartExample.less');
const React = require('react');
const ReactDOM = require('react-dom');

import RawLineChart from '../RawLineChart.js';
import renderExample from './renderExample.js';

export default class VerticalRawLineChartExample extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      model: {
        mapPoint: handler => {
          const dummyData = [
            {id: 'a', isHorizontal: false, domain:5, value:70},
            {id: 'b', isHorizontal: false, domain:6, value:22},
            {id: 'e', isHorizontal: false, domain:12, value:5},
            {id: 'd', isHorizontal: false, domain:20, value:45},
            {id: 'e', isHorizontal: false, domain:23, value:10},
            {id: 'f', isHorizontal: false, domain:24, value:70},
            {id: 'g', isHorizontal: false, domain:29, value:0},
            {id: 'h', isHorizontal: false, domain:31, value:5},
            {id: 'i', isHorizontal: false, domain:35, value:35},
            {id: 'j', isHorizontal: false, domain:42, value:20},
            {id: 'k', isHorizontal: false, domain:45, value:90},
            {id: 'l', isHorizontal: false, domain:46, value:12},
            {id: 'm', isHorizontal: false, domain:49, value:15},
            {id: 'n', isHorizontal: false, domain:50, value:35},
            {id: 'o', isHorizontal: false, domain:53, value:40},
            {id: 'p', isHorizontal: false, domain:54, value:20},
            {id: 'q', isHorizontal: false, domain:59, value:22},
            {id: 'r', isHorizontal: false, domain:61, value:0},
            {id: 's', isHorizontal: false, domain:65, value:45},
            {id: 't', isHorizontal: false, domain:62, value:10}
          ];
          return dummyData.map(handler);
        }
      }
    };
  }

  _renderExample() {
    return React.DOM.div(
      {style: {position: 'relative'}, ref: 'example'},
      React.createElement(
        RawLineChart,
        {
          lineClassName: 'blue-line',
          model: this.state.model,
          width: 1200, height: 400,
          style: {height: '200px'}
        }
      )
    );
  }

  render() {
    return renderExample({
      title: 'RawLineChart (vertical)',
      oneLiner: 'implements the raw line charts',
      details: React.DOM.div(
        null,
        'This quick example below illustrates rendering a regular line chart'
      ),
      example: this._renderExample()
    });
  }
};
