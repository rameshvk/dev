'use strict';

import BaseComponent from './BaseComponent';
import React from 'react';

function TogglerView(props) {
  return React.cloneElement(
    React.Children.only(props.children),
    {onClick: props.onToggle}
  );
};

TogglerView.propTypes = {
  onToggle: React.PropTypes.func.isRequired
};

export default BaseComponent.make(TogglerView);
