'use strict';

const React = require('react');
import PureRenderComponent from './PureRenderComponent.js';

const TogglePropTypes = {
  showIndex: React.PropTypes.number.isRequired
};

export default class Toggle extends PureRenderComponent {
  render() {
    const showIndex = this.props.showIndex, children = this.props.children;
    const numChildren = React.Children.count(children);

    if (showIndex >= numChildren) {
      throw new Error(`showIndex(${showIndex}) is invalid, numChildren = ${numChildren}`);
    }
    if (showIndex === 0 && numChildren === 1) {
      return React.Children.only(this.props.children);
    }
    return React.Children.toArray(this.props.children)[showIndex];
  }
};

Toggle.propTypes = TogglePropTypes;
