'use strict';

import BaseComponent from '../ux/BaseComponent.js';
import React from 'react';
import ReactDOM from 'react-dom';
import Demo from './Demo';
import DemoDescription from './DemoDescription.js';

function fib(n) {
  if (n <= 0) return 1;
  return fib(n-1) + fib(n-2);
}

export default class TextViewDemo extends BaseComponent {
  constructor(props) {
    super(props);
    this._version = 0;
    this._vrsionUpdated = 0;
    this.state = {version: 0};
    this._onKeyDown = ee => this.onKeyDown(ee);
  }

  componentDidUpdate() {
    console.log("Rendered version", this.state.version, 'latest version =', this._version);
    this._versionUpdated = this.state.version;
    if (this.state.q3 !== this._version) {
      this.setState({q3: this._version});
    }
  }

  onKeyDown(ee) {
    ee.preventDefault();
    ee.stopPropagation();

    console.log('wasting time, first round');
    fib(39);
    console.log('finished wasting time');
    if (this._version !== this.state.version) {
      console.log('Version skew', this._version, 'state=', this.state.version);
    }
    this._version ++;
    this.setState({version: this._version});
    this.setState({q1: this._version});
    this.setState({q2: this._version});
  }

  render() {
    return Demo.create(
      {title: 'Testing React Batched Events'},
      React.DOM.div(
        null,
        DemoDescription.create({}, 'Testing React Batched Events'),
        DemoDescription.create({}, 'Text View yoyo'),
        React.DOM.div(
          {style: {padding: 10, minHeight: 200}},
          React.DOM.div(
            {
              tabIndex: 0,
              onKeyDown: this._onKeyDown,
            },
            'Some Text here for this focusable element'
          )
        )
      )
    );
  }
};
