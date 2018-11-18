'use strict';

import BaseComponent from '../ux/BaseComponent.js';
import React from 'react';

export default BaseComponent.make(function DemoDescription(props) {
  return React.DOM.div({className: 'demo-description', children: props.children});
});
