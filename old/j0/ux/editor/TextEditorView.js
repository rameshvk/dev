'use strict';

require('./TextEditorView.less');

import React from 'react';
import ReactDOM from 'react-dom';
import BaseComponent from '../BaseComponent';
import Caret from './Caret';
import InvisibleInput from './InvisibleInput';
import TextSelectionView from './TextSelectionView';
import getTextNodeInfoForPoint from '../../dom/getTextNodeInfoForPoint';
import MouseModel from './MouseModel';
import AttentionManager from './AttentionManager';

export default class TextEditorView extends BaseComponent {
  constructor(props) {
    super(props);
    this._onMouseDown = ee => this.onMouseDown(ee);
    this._caret = Caret.create({isActive: false, isCollapsed: true});
    this._mouseModel = null;
    this._attentionManager = new AttentionManager();
  }

  componentDidMount() {
    this._mouseModel = new MouseModel(this.props.selection, ReactDOM.findDOMNode(this));
    this._attentionManager.startTracking(ReactDOM.findDOMNode(this));
    // TODO: do this via events
    this.props.selection.setAttentionManager(this._attentionManager);
  }

  componentWillUnmount() {
    this._mouseModel.cleanup();
  }

  onMouseDown(ee) {
    const clickCount = this._mouseModel.onMouseDown(ee);
    if (clickCount && !this.props.isActive) {
      this.props.onActivate(ee);
    }
  }

  _renderInput(isActive, selection) {
    return InvisibleInput.create({key: 1, isActive, selection});
  }

  _renderCaret(isActive) {
    return React.cloneElement(this.props.caret || this._caret, {key: 0, isActive});
  }

  render() {
    const isActive = this.props.isActive;
    const selection = this.props.selection;
    return React.DOM.div(
      {
        className: 'j0editor ' + (isActive ? 'active ' : '') + (this.props.className || ''),
        onMouseDown: this._onMouseDown
      },
      this.props.children,
      this.props.selectionOverlays,
      TextSelectionView.create({
        className: 'j0selections ' + (isActive? 'active' : ''),
        selection,
        anchorMarker: [],
        focusMarker: [this._renderInput(isActive, selection), this._renderCaret(isActive, selection)]
      })
    );
  }
}

TextEditorView.propTypes = {
  className: React.PropTypes.string,
  selection: React.PropTypes.object.isRequired,
  selectionOverlays: React.PropTypes.array,
  caret: React.PropTypes.element,
  isActive: React.PropTypes.bool.isRequired,
  onActivate: React.PropTypes.func.isRequired
};
