'use strict';

import React from 'react';
import MovableDemo from './MovableDemo';
import GetNearestRectForPointDemo from './GetNearestRectForPointDemo';
import GetBoundingLineRectsDemo from './GetBoundingLineRectsDemo';
import TextEditorViewDemo from './TextEditorViewDemo';

export default function Demos() {
  return React.DOM.div(
    null,
    React.createElement(TextEditorViewDemo),
    React.createElement(MovableDemo),
    React.createElement(GetNearestRectForPointDemo),
    React.createElement(GetBoundingLineRectsDemo)
  );
};
