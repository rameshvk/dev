'use strict';

import BaseComponent from '../BaseComponent';
import React from 'react';
import ReactDOM from 'react-dom';

require('./TextView.less');

function objectShallowEquals(a, b) {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (typeof a !== 'object') return false;
  if (!!a != !!b) return false;
  for (let key in a) {
    if (a[key] !== b[key]) return false;
  }
  for (let key in b) {
    if (a[key] !== b[key]) return false;
  }
  return true;
}

export default class TextView extends BaseComponent {
  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.text !== this.props.text ||
      nextProps.className !== this.props.className ||
      !objectShallowEquals(nextProps.style, this.props.style);
  }

  componentDidMount() {
    this._node = ReactDOM.findDOMNode(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.id !== this.props.id) {
      this._node.id = nextProps.id;
    }
  }

  render() {
    const isEmpty = !this.props.text;
    const props = {
      className: 'j0text ' + (this.props.className || ''),
      id: this.props.id,
      style: this.props.style,
    };

    if (isEmpty) props['data-empty'] = true;
    if (this.props.lgap) props['data-lgap'] = this.props.lgap;
    if (this.props.rgap) props['data-rgap'] = this.props.rgap;

    return React.DOM.span(props, isEmpty ? '\u200B' : this.props.text);
  }
}

TextView.propTypes = {
  text: React.PropTypes.string.isRequired,
  id: React.PropTypes.string.isRequired,
  className: React.PropTypes.string,
  lgap: React.PropTypes.bool,
  rgap: React.PropTypes.bool,
  style: React.PropTypes.object,
};
