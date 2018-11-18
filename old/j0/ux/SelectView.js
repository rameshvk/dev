'use strict';

import BaseComponent from './BaseComponent.js';
import React from 'react';

function SelectView(props) {
  return React.Children.toArray(props.children)[props.optionIndex];
};

SelectView.propTypes = {
  optionIndex: React.PropTypes.number.isRequired
};

export default BaseComponent.make(SelectView);
