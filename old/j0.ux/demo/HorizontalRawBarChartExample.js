'use strict';

require('./RawBarChartExample.less');
const React = require('react');
import RawBarChart from '../RawBarChart.js';
import renderExample from './renderExample.js';

export default class HorizontalRawBarChartExample extends React.Component {
  constructor(props) {
    super(props);
    this.state = {model: {
      mapBar: handler => {
        const dummyData = [
          {id: 'a', isHorizontal: true, start:0, end:5, value:70, className: 'fill-red'},
          {id: 'b', isHorizontal: true, start:10, end:20, value:22, className: 'fill-blue'},
          {id: 'c', isHorizontal: true, start:90, end:100, value:10, className: 'fill-green'},
          {id: 'd', isHorizontal: true, start:30, end:32, value:45, className: 'fill-red'},
          {id: 'e', isHorizontal: true, start:37, end:50, value:5, className: 'fill-green'}
        ];
        return dummyData.map(handler);
      },
      onMouseEnter: ee => true,
      onMouseLeave: ee => true
    }};
  }

  _renderExample() {
    return React.createElement(
      RawBarChart,
      {model: this.state.model, width: 1200, height: 400, style: {height: '200px'}}
    );
  }

  render() {
    return renderExample({
      title: 'RawBarChart (horizontal)',
      oneLiner: 'implements the raw bar charts',
      details: React.DOM.div(
        null,
        'This quick example below illustrates rendering a horizontal bar chart quickly'
      ),
      example: this._renderExample()
    });
  }
};
