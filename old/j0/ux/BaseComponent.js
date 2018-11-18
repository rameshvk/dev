'use strict';

const React = require('react');

function shallowEqualDictionary(before, after) {
  for (const key in before) if (before.hasOwnProperty(key) && before[key] !== after[key]) {
    if (typeof before[key] !== 'function' && typeof after[key] !== 'function') return false;
  }
  for (const key in after) if (after.hasOwnProperty(key) !== before.hasOwnProperty(key)) {
    if (typeof before[key] !== 'function' && typeof after[key] !== 'function') return false;
  }
  return true;
}

function shallowCompare(oldProps, newProps, oldState, newState) {
  return shallowEqualDictionary(oldProps, newProps) && shallowEqualDictionary(oldState, newState);
};

export default class BaseComponent extends React.Component {
  shouldComponentUpdate(props, state) {
    return !shallowCompare(this.props, props, this.state, state);
  }

  static create(props, ...children) {
    return React.createElement(this, props, ...children);
  }

  static make(purefn) {
    purefn.create = (props, ...children) => React.createElement(purefn, props, ...children);
    return purefn;
  }
};
