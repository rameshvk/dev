'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import BaseComponent from '../BaseComponent';
import AnimationFrameRefreshMixin from '../AnimationFrameRefreshMixin';

import getCaretAtTextNodePosition from '../../dom/getCaretAtTextNodePosition.js';
import getBoundingLineRects from '../../shape/rect/getBoundingLineRects.js';
import getRangeClientRects from '../../dom/getRangeClientRects.js';
import areRectsEqual from '../../shape/rect/isEqual';
import getScrollParent from '../../dom/getScrollParent';

const MIN_SEL_RECT_WIDTH = 2;

function normalizeLineRects(rects) {
  return rects.map(r => ({
    left: r.left, top: r.top, bottom: r.bottom, right: Math.max(r.left + MIN_SEL_RECT_WIDTH, r.right)
  }));
}

class BaseTextSelectionView extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {lineRects: [], focusRect: null, anchorRect: null};
    this._root = null;
  }

  componentDidMount() {
    this._root = ReactDOM.findDOMNode(this).offsetParent;
  }

  _getFocusAnchorInfo() {
    const selection = this.props.selection;
    const focus = (document.getElementById(selection.focusId) || {}).firstChild;
    const focusRect = getCaretAtTextNodePosition(focus, selection.focusOffset, selection.focusWrapped);

    const showAnchor = selection.anchorId !== selection.focusId || selection.anchorOffset !== selection.focusOffset;
    const anchor = showAnchor && (document.getElementById(selection.anchorId) || {}).firstChild;
    const anchorRect = getCaretAtTextNodePosition(anchor, selection.anchorOffset, selection.anchorWrapped);

    return {focus, anchor, focusRect, anchorRect};
  }

  onAnimationFrame() {
    const selection = this.props.selection;
    const update = {};
    const {focus, focusRect, anchor, anchorRect} = this._getFocusAnchorInfo();

    if (!areRectsEqual(focusRect, this.state.focusRect)) update.focusRect = focusRect;
    if (!areRectsEqual(anchorRect, this.state.anchorRect)) update.anchorRect = anchorRect;

    if (Object.keys(update).length === 0) return;

    if (anchor && focus) {
      const rects = normalizeLineRects(getRangeClientRects(
        anchor, selection.anchorOffset, focus, selection.focusOffset, '.text'
      ));
      update.lineRects = getBoundingLineRects(rects, {});
    } else if (this.state.lineRects.length) {
      update.lineRects = [];
    }

    this.setState(update);
  }

  renderSelectionRectangles() {
    if (!this.state.lineRects.length) return null;
    const rootRect = this._root.getBoundingClientRect();
    return this.state.lineRects.map((rect, index) => {
      const style = {
        position: 'absolute',
        top: rect.top - rootRect.top + this._root.scrollTop,
        left: rect.left - rootRect.left + this._root.scrollLeft,
        height: rect.bottom - rect.top,
        width: Math.max(rect.right - rect.left, MIN_SEL_RECT_WIDTH)
      };
      return React.DOM.div({className: this.props.className, style, key: index});
    });
  }

  renderMarker(className, rect, component) {
    if (!rect || !component) return null;
    const rootRect = this._root.getBoundingClientRect();
    const style = {
      position: 'absolute',
      top: rect.top - rootRect.top + this._root.scrollTop,
      left: rect.left - rootRect.left + this._root.scrollLeft,
      height: rect.bottom - rect.top,
      width: 0
    };
    const isCollapsed = this.props.selection.isCollapsed();
    return React.DOM.div(
      {className, style},
      React.Children.map(component, elt =>  React.cloneElement(elt, {isCollapsed}))
    );
  }

  render() {
    return React.DOM.div(
      {className: 'selection-placeholder', style: {width: 0, height: 0}},
      this.renderSelectionRectangles(),
      this.renderMarker('anchor-marker', this.state.anchorRect, this.props.anchorMarker),
      this.renderMarker('focus-marker', this.state.focusRect, this.props.focusMarker)
    );
  }
}

const TextSelectionView = AnimationFrameRefreshMixin(BaseTextSelectionView);
TextSelectionView.propTypes = {
  className: React.PropTypes.string,
  selection: React.PropTypes.object.isRequired,
  anchorMarker: React.PropTypes.arrayOf(React.PropTypes.element),
  focusMarker: React.PropTypes.arrayOf(React.PropTypes.element)
};

export default TextSelectionView;
