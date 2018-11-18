'use strict';

const React = require('react');
import ToggleExample from './ToggleExample.js';
import MovableExample from './MovableExample.js';
import SliderExample from './SliderExample.js';
import RangeSelectorExample from './RangeSelectorExample.js';
import RangeSelectorExample2 from './RangeSelectorExample2.js';
import HorizontalRawBarChartExample from './HorizontalRawBarChartExample.js';
import VerticalRawBarChartExample from './VerticalRawBarChartExample.js';
import VerticalRawLineChartExample from './VerticalRawLineChartExample.js';

export default class Examples extends React.Component {
  render() {
    const examples = [
      ToggleExample,
      MovableExample,
      SliderExample,
      RangeSelectorExample,
      RangeSelectorExample2,
      HorizontalRawBarChartExample,
      VerticalRawBarChartExample,
      VerticalRawLineChartExample
    ];

    return React.DOM.div(
      null,
      examples.map(example => React.createElement(example, {key: example.name}))
    );
  }
};
