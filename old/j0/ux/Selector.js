'use strict';

import BaseComponent from './BaseComponent.js';
import React from 'react';
import SelectView from './SelectView.js';

function getState(props) {
  return {optionIndex: props.model.get(React.Children.count(props.children))};
}

export default class Selector extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = getState(props);
    this._onChange = () => this.setState(getState(this.props));
    this.props.model.on('change', this._onChange);
  }
  componentWillUnmount() {
    this.props.model.removeListener('change', this._onChange);
  }
  render() {
    return SelectView.create({
      optionIndex: this.state.optionIndex,
      children: this.props.children
    });
  }
};

Selector.propTypes = {
  model: React.PropTypes.object.isRequired
};
