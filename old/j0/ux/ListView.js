'use strict';

import BaseComponent from './BaseComponent';
import React from 'react';
import ReactDOM from 'react-dom';


function getScrollContainer(node) {
  let parent = node;
  while (parent !== document.body) {
    if (window.getComputedStyle(parent).overflowY !== 'visible') {
      return parent;
    }
    parent = parent.parentNode;
  }
  return document.body;
}

function isElementVisible(containerRect, nodeRect) {
  const grace = 5;
  return (containerRect.top < nodeRect.top && nodeRect.top + grace < containerRect.bottom) ||
    (containerRect.top + grace < nodeRect.bottom && nodeRect.bottom < containerRect.bottom);
}

function findFirstVisibleElementIndex(container, nodes, hintIndex) {
  const containerRect = container.getBoundingClientRect();
  const hint = nodes[hintIndex];
  if (hint && isElementVisible(containerRect, hint.getBoundingClientRect())) {
    return hintIndex;
  }
  for (let kk = 0; kk < nodes.length; kk ++) {
    if (isElementVisible(containerRect, nodes[kk].getBoundingClientRect())) {
      return kk;
    }
  }
  return -1;
}

function scrollElementIntoView(container, node, grace = 10) {
  if (!node) return;
  const containerRect = container.getBoundingClientRect();
  const nodeRect = node.getBoundingClientRect();
  let delta = 0;

  if (nodeRect.top >= containerRect.top && nodeRect.bottom + grace > containerRect.bottom) {
    delta = containerRect.bottom - nodeRect.bottom - grace;
  } else if (nodeRect.top < containerRect.top + grace) {
    delta = containerRect.top + grace - nodeRect.top;
  }
  if (delta) container.scrollTop -= delta;
}

function getRelativeTop(container, node) {
  return node.getBoundingClientRect().top - container.getBoundingClientRect().top;
}

function getReactChildIndexForKey(children, key) {
  let index = -1, count = 0;
  if (typeof key === 'undefined' || key === null) return -1;
  React.Children.forEach(children, child => {
    if (!child) return;
    if (child.key === key) { index = count; }
    count ++;
  });
  return index;
}

function getReactChildNodeForKey(ownNode, children, key) {
  const index = getReactChildIndexForKey(children, key);
  return ownNode.children[index];
}

function getReactChildKeyForIndex(children, index) {
  let key, count = 0;
  if (index < 0) return key;
  React.Children.forEach(children, child => {
    if (!child) return;
    if (index === count) { key = child.key; }
    count ++;
  });
  return key;
};

function getClonedChildrenWithSelection(children, key) {
  return React.Children.map(children, child => {
    if (child.key !== key) return React.cloneElement(child, {key: child.key});
    const className = (child.props.className || '') + ' selected';
    return React.cloneElement(child, {className, key: child.key});
  });
}

export default class ListView extends BaseComponent {
  constructor(props) {
    super(props);
    this._placementKey = this.props.selectedKey;
    this._selectedKey = this.props.selectedKey;
    this._placement = null;
    this._scrollTimer = null;
    this._topPinned = false;
    this._bottomPinned = false;
  }

  componentDidMount() {
    this._container = getScrollContainer(ReactDOM.findDOMNode(this));
    this._onScrollHandler = () => {
      if (this._scrollTimer) return;
      // TODO: debounce it yo
      this._scrollTimer = window.requestAnimationFrame(() => this._onScroll());
    };
    this._container.addEventListener('scroll', this._onScrollHandler);
    this.componentDidUpdate(this.props);
  }

  componentWillUnmount() {
    window.cancelAnimationFrame(this._scrollTimer);
    this._scrollTimer = null;
    this._container.removeEventListener('scroll', this._onScrollHandler);
  }

  componentDidUpdate(prevProps) {
    let selectionChanged = false;
    if (prevProps.selectedKey !== this.props.selectedKey) {
      this._topPinned = this._bottomPinned = false;
      this._placement = null;
      this._selectedKey = this.props.selectedKey;
      this._placementKey = this._selectedKey;
      scrollElementIntoView(
        this._container,
        getReactChildNodeForKey(ReactDOM.findDOMNode(this), this.props.children, this.props.selectedKey)
      );
    }

    if (this._topPinned || this._bottomPinned) {
      return this._updatePinnedPlacements();
    }

    const placementNodeIndex = getReactChildIndexForKey(this.props.children, this._placementKey);
    if (placementNodeIndex < 0) {
      this._recalculatePlacement();
    } else if (this._placement) {
      this._maintainPlacement(placementNodeIndex, this._placement);
    } else {
      this._placement = this._getPlacement(placementNodeIndex);
    }
  }

  render() {
    return React.DOM.div(
      {className: 'list ' + (this.props.className || '')},
      getClonedChildrenWithSelection(this.props.children, this.props.selectedKey)
    );
  }

  _updatePinnedPlacements() {
    if (this._topPinned) {
      this._container.scrollTop = 0;
    } else if (this._bottomPinned) {
      this._container.scrollTop = this._container.scrollHeight - this._container.clientHeight;
    }
  }

  _onScroll() {
    cancelAnimationFrame(this._scrollTimer);
    this._scrollTimer = null;
    const grace = 3;
    if (Math.abs(this._container.scrollTop) < grace) {
      this._topPinned = true;
    } else if (Math.abs(this._container.scrollHeight - this._container.scrollTop - this._container.clientHeight) < grace) {
      this._bottomPinned = true;
    } else {
      this._topPinned = this._bottomPinned = false;
      this._recalculatePlacement();
    }
    this._updatePinnedPlacements();
  }

  _recalculatePlacement() {
    const selectedNodeIndex = getReactChildIndexForKey(this.props.children, this._selectedKey);

    const nodes = ReactDOM.findDOMNode(this).children;
    const placementNodeIndex = findFirstVisibleElementIndex(this._container, nodes, selectedNodeIndex);

    this._placement = this._getPlacement(placementNodeIndex);
    this._placementKey = getReactChildKeyForIndex(this.props.children, placementNodeIndex);
    console.log('Placement = ', placementNodeIndex, this._placement);
  }

  _getPlacement(index) {
    const node = ReactDOM.findDOMNode(this).children[index];
    if (!node) return null;
    console.log('Setting placement', getRelativeTop(this._container, node));
    return {top: getRelativeTop(this._container, node)};
  }

  _maintainPlacement(index, {top}) {
    const node = ReactDOM.findDOMNode(this).children[index];
    if (!node) return;
    const current = getRelativeTop(this._container, node);
    console.log('Maintaining placement', top, current, this._container.scrollTop);
    this._container.scrollTop += current - top;
  }
};
