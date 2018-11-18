'use strict';

const React = require('react');
import Toggle from '../Toggle.js';
import Toggler from '../Toggler.js';

const ChevronDown = '▽';
const ChevronUp = '△';
const ExamplePropTypes = {
  title: React.PropTypes.string.isRequired,
  oneLiner: React.PropTypes.string.isRequired,
  details: React.PropTypes.element.isRequired,
  children: React.PropTypes.element.isRequired
};

class Example extends React.Component {
  constructor(props) {
    super(props);
    this.state = {showIndex: 0};
    this.onChangeIndex = showIndex => this.setState({showIndex});
  }

  _renderToggler(chevron) {
    const initIndex = this.state.showIndex, maxIndex = 2, onChange = this.onChangeIndex;
    return React.createElement(
      Toggler, {initIndex, maxIndex, onChange},
      React.DOM.span(
        null,
        this.props.title,
        React.DOM.span(
          {style: {fontSize: 'medium', fontWeight: 'normal'}},
          ' - ',
          this.props.oneLiner,
          ' ',
          chevron
        )
      )
    );
  }

  render() {
    const details = {width: '100%', padding: 15, outline: '1px solid blue', boxSizing: 'border-box'};
    return React.createElement(
      Toggle,
      {showIndex: this.state.showIndex},
      React.DOM.h2(null, this._renderToggler(ChevronDown)),
      React.DOM.div(
        null,
        React.DOM.h2(null, this._renderToggler(ChevronUp)),
        React.DOM.div({style: {padding: 10}}, this.props.details),
        React.DOM.div(
          {style: {padding: 10}},
          React.DOM.div({style: details}, this.props.children)
        )
      )
    )
  }
};

Example.propTypes = ExamplePropTypes;

export default function renderExample({title, oneLiner, details, example}) {
  return React.createElement(Example, {title, oneLiner, details}, example);
};
