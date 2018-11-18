'use strict';

const React = require('react');
import Slider from '../Slider.js';
import renderExample from './renderExample.js';
import {Ellipsis as EllipsisGrabber} from '../grabbers.js';

function normalize(x) {
  return Math.max(Math.min(x, 100), 0);
};

export default class SliderExample extends React.Component {
  constructor(props) {
    super(props);
    this.state = {percentage: 30};
    this._onChange = percentage => this.setState({percentage: normalize(percentage)})
  }

  _renderSlider() {
    const percentage = this.state.percentage, onChange = this._onChange;
    return React.DOM.div(
      {style: {height: '1px', background: 'rgb(230, 230, 230)'}},
      React.createElement(Slider, {percentage, onChange}, EllipsisGrabber.center.render())
    );
  }

  render() {
    return renderExample({
      title: 'Slider',
      oneLiner: 'implements horizontal slider',
      details: React.DOM.div(null, 'Try this control out by moving the grabber left to right.'),
      example: this._renderSlider()
    });
  }
};
