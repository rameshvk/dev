'use strict';

const React = require('react');
import Slider from './Slider.js';
import PureRenderComponent from './PureRenderComponent';
import {Ellipsis as EllipsisGrabber} from './grabbers.js';

const RangeSelectorPropTypes = {
  startPercentage: React.PropTypes.number.isRequired,
  endPercentage: React.PropTypes.number.isRequired,
  grabber: React.PropTypes.object,
  onChange: React.PropTypes.func.isRequired
};

export default class RangeSelector extends PureRenderComponent {
  constructor(props) {
    super(props);
    this._onStartChange = percentage => {
      this.props.onChange(percentage,  this.props.endPercentage);
    };
    this._onEndChange = percentage => this.props.onChange(this.props.startPercentage, percentage);
  }

  _renderStartSlider() {
    const percentage = this.props.startPercentage, onChange = this._onStartChange;
    const grabber = (this.props.grabber || EllipsisGrabber).left.render();
    return React.createElement(Slider, {percentage, onChange}, grabber);
  }

  _renderEndSlider() {
    const percentage = this.props.endPercentage, onChange = this._onEndChange;
    const grabber = (this.props.grabber || EllipsisGrabber).right.render();
    return React.createElement(Slider, {percentage, onChange}, grabber);
  }

  render() {
    return React.DOM.div(
      {style: {height: 1, background: 'rgb(230, 230, 230)'}},
      this._renderStartSlider(),
      this._renderEndSlider()
    );
  }
};
