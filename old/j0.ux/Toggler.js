'use strict';

const React = require('react');
import PureRenderComponent from './PureRenderComponent.js';

const TogglerPropTypes = {
  initIndex: React.PropTypes.number,
  maxIndex: React.PropTypes.number.isRequired,
  children: React.PropTypes.element.isRequired,
  onChange: React.PropTypes.func.isRequired
};

export default class Toggler extends PureRenderComponent {
  constructor(props) {
    super(props);
    const showIndex = (this.props.initIndex || 0) % this.props.maxIndex;
    this.state = {showIndex};
  }

  _setIndex(index) {
    const showIndex = index % this.props.maxIndex;
    this.props.onChange(showIndex);
    this.setState({showIndex});
  }

  onClick(ee) {
    if (ee.button !== 0) return;
    ee.stopPropagation();
    const increment = ee.shiftKey ? - 1 : 1;
    this._setIndex(this.state.showIndex + this.props.maxIndex + increment);
  }

  render() {
    return React.DOM.span(
      {onClick: ee => this.onClick(ee)},
      this.props.children
    );
  }
};
