'use strict';

import BaseComponent from './BaseComponent';
import React from 'react';

export default class Movable extends BaseComponent {
  constructor(props) {
    super(props);
    this.props.model.on('change', () => this.setState(this.props.model.getPosition()));
    this._onMouseDown = ee => {
      // TODO: where does the preventDefault go?  I think it should go into MouseModel?
      if (ee.button === 0) ee.preventDefault();
      this.props.model.onMouseDown(ee);
    };
    this.state = this.props.model.getPosition();

  }

  render() {
    const style = {left: this.state.x, top: this.state.y};
    const onMouseDown = this._onMouseDown;
    return React.cloneElement(React.Children.only(this.props.children), {style, onMouseDown});
  }
};

Movable.propTypes = {
  model: React.PropTypes.object.isRequired
};
