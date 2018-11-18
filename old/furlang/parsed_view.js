'use strict';

const {isTerminal} = require('./rewrite');
const React = require('react');
const _ = require('lodash');

function ErrorView(props) {
  const {error, count} = props;
  return React.DOM.span({className: 'inline-error', 'data-count': count, title: error});
}

class FoldView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {folded: true};
    this._onClick = () => this.setState({folded: !this.state.folded});
  }

  render() {
    const text = this.state.folded ? "\u2026" : this.props.text;
    const className = this.state.folded ? 'folded' : 'unfolded';
    return React.DOM.span({className, key: 'fold', onClick: this._onClick}, text);
  }
}

class ParsedView extends React.Component {
  static get propTypes() {
    return {
      input: React.PropTypes.string.isRequired,
      parsed: React.PropTypes.any,
      epoch: React.PropTypes.number.isRequired,
    };
  }

  render() {
    const segments = segment(this.props.input, this.props.parsed);
    return React.DOM.div(
      {},
      _.map(segments, (segment, ii) => {
        const key = `${this.props.epoch}-${ii}`;
        if (segment.error) return React.createElement(ErrorView, {error: segment.error, count: segment.count, key});
        if (segment.fold) return React.createElement(FoldView, {text: segment.fold, key});
        if (segment.text) return React.DOM.span({key}, segment.text);
      }),
      _.map(segments, (segment, ii) => {
        const key = `index-${this.props.epoch}-${ii}`;
        if (segment.error) return React.DOM.div(
          {key},
          React.createElement(ErrorView, segment),
          React.DOM.span({className: 'error-legend'}, segment.error)
        );
      })
    );
  }
}

function segment(input, parsed) {
  const segments = [];
  const indicesMap = {};
  const errorsMap = {};
  const foldsMap = {};
  const addFold = (start, end) => {
    indicesMap[start] = indicesMap[end] = true;
    foldsMap[start] = true;
  };
  const addError = (offset, error) => {
    indicesMap[offset] = true;
    errorsMap[offset] = errorsMap[offset] || [];
    errorsMap[offset].push(error);
  }
  traverse(parsed, addFold, addError);
  let sliced = input;
  let errorCount = Object.keys(errorsMap).length;
  const results = _.reduce(
    Object.keys(indicesMap).sort((a, b) => b - a),
    (segments, offset) => {
      const text = sliced.slice(+offset);
      sliced = sliced.slice(0, +offset);
      const result = [];
      if (errorsMap[offset]) {
        result.push({count: errorCount--, error: errorsMap[offset].join(', ')});
      }
      if (foldsMap[offset]) {
        result.push({fold: text});
      } else if (text) {
        result.push({text});
      }
      return result.concat(segments);
    },
    []
  );
  return sliced ? [{text: sliced}].concat(results) : results;
}

function traverse(parsed, addFold, addError) {
  if (!parsed) return;
  if (parsed.type === 'error') {
    addError(parsed.loc[1], parsed.error);
  }
  if (parsed.type === 'string') {
    addFold(parsed.loc[0], parsed.loc[1]);
  }
  if (isTerminal(parsed)) return;
  const children = Array.isArray(parsed.value) ? parsed.value : [parsed.value];
  _.forEach(children, child => traverse(child, addFold, addError));
}

exports.ParsedView = ParsedView;
