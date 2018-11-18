'use strict';

const React = require('react');
import shallowCompare from './shallowCompare.js';

export default class PureRenderComponent extends React.Component {
  shouldComponentUpdate(props, state) {
    return !shallowCompare(this.props, props, this.state, state);
  }
};
