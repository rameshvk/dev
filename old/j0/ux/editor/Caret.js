'use strict';

require('./Caret.less');
import React from 'react';
import BaseComponent from '../BaseComponent';

function Caret(props) {
  const visibility = props.isCollapsed ? 'visible' : 'hidden';
  return React.DOM.div({
    className: props.isActive ? 'j0caret blink' : 'j0caret',
    style: {visibility}
  })
}

Caret.propTypes = {
  isActive: React.PropTypes.bool.isRequired,
  isCollapsed: React.PropTypes.bool.isRequired,
};

export default BaseComponent.make(Caret);
