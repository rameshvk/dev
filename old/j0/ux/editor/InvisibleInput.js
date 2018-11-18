'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import BaseComponent from '../BaseComponent';
import AnimationFrameRefreshMixin from '../AnimationFrameRefreshMixin';

class BaseInvisibleInput extends BaseComponent {
  constructor(props) {
    super(props);
    this._onKeyDown = ee => this.onKeyDown(ee);
    this._self = null;
  }

  componentDidMount() {
    this._self = ReactDOM.findDOMNode(this);
  }

  componentWillUnmount() {
    this._self = null;
  }

  onAnimationFrame() {
    const isActive = this._self === document.activeElement;
    if (!isActive === !this.props.isActive) return;
    if (this.props.isActive) this._self.focus(); else this._self.blur();
  }

  onKeyDown(ee) {
    const selection = this.props.selection;
    let key = ee.shiftKey ? 'Shift+' + ee.key : ee.key;
    key = ee.altKey ? ('Alt+' + key) : key;

    switch(key) {
    case 'Shift+ArrowRight':
      selection.extendCursor(true);
      break;
    case 'Shift+ArrowLeft':
      selection.extendCursor(false);
      break;
    case 'Shift+ArrowUp':
      selection.extendCursorVertically(true);
      break;
    case 'Shift+ArrowDown':
      selection.extendCursorVertically(false);
      break;
    case 'ArrowRight':
      selection.moveCursor(true);
      break;
    case 'ArrowLeft':
      selection.moveCursor(false);
      break;
    case 'ArrowUp':
      selection.moveCursorVertically(true);
      break;
    case 'ArrowDown':
      selection.moveCursorVertically(false);
      break;
    case 'Alt+ArrowRight':
      selection.moveWord(true);
      break;
    case 'Alt+ArrowLeft':
      selection.moveWord(false);
      break;
    case 'Alt+Shift+ArrowRight':
      selection.extendWord(true);
      break;
    case 'Alt+Shift+ArrowLeft':
      selection.extendWord(false);
      break;
    default:
      return;
    }
    ee.preventDefault();
    ee.stopPropagation();
  }

  render() {
    return React.DOM.div(
      {
        contentEditable: this.props.isActive,
        style: {
          position: 'absolute',
          top: 0,
          left: -1,
          bottom: 0,
          minWidth: 2,
          width: '100%',
          height: '100%',
          opacity: 0,
          overflow: 'hidden',
          outline: 0,
        },
        dangerouslySetInnerHTML: {__html: '\u2000b'},
        onKeyDown: this._onKeyDown
      }
    );
  }
}

const InvisibleInput = AnimationFrameRefreshMixin(BaseInvisibleInput);
InvisibleInput.propTypes = {
  isActive: React.PropTypes.bool.isRequired,
  selection: React.PropTypes.object.isRequired
};

export default InvisibleInput;
