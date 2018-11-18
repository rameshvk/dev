'use strict';

const React = require('react');
const ReactDOM = require('react-dom');
import Movable from './Movable.js';
import PureRenderComponent from './PureRenderComponent';

const SliderPropTypes = {
  percentage: React.PropTypes.number.isRequired,
  children: React.PropTypes.element.isRequired,
  onChange: React.PropTypes.func.isRequired
};

export default class Slider extends PureRenderComponent {
  constructor(props) {
    super(props);
    this._movableModel = Movable.createModel()
      .on('move-start', (start, current) => this._onChange(current.x))
      .on('move', (start, current) => this._onChange(current.x))
      .on('move-end', (start, current) => this._onChange(current.x))
      .on('move-cancel', (start, current) => this._onChange(start.x));
  }

  componentWillUnmount() {
    this._movableModel.removeAllListeners();
  }

  _onChange(x) {
    const ownNode = ReactDOM.findDOMNode(this);
    const rect = ownNode.parentNode.getBoundingClientRect();
    this.props.onChange(Math.floor((x - rect.left) * 100 / rect.width));
  }

  render() {
    return React.DOM.span(
      {style: {
        position: 'relative',
        left: this.props.percentage + '%'
      }},
      React.createElement(Movable, {model: this._movableModel}, this.props.children)
    );
  }
};

Slider.propTypes = SliderPropTypes;
