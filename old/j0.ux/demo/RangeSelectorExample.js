'use strict';

const React = require('react');
import RangeSelector from '../RangeSelector.js';
import renderExample from './renderExample.js';

function normalizeOne(x) {
  return Math.max(Math.min(x, 100), 0);
};

function normalize({start, end}) {
  const nStart = normalizeOne(start), nEnd = normalizeOne(end);
  return {start: Math.min(nStart, nEnd), end: Math.max(nStart, nEnd)};
};

export default class RangeSelectorExample extends React.Component {
  constructor(props) {
    super(props);
    this.state = {start: 40, end: 60};
    this._onChange = (start, end) => this.setState(normalize({start, end}));
  }

  _renderRangeSelector() {
    const startPercentage = this.state.start;
    const endPercentage = this.state.end;
    const onChange = this._onChange;

    return React.createElement(RangeSelector, {startPercentage, endPercentage, onChange});
  }

  render() {
    return renderExample({
      title: 'Range Selector',
      oneLiner: 'implements two slider controls rolled into one to control start, end',
      details: React.DOM.div(null, 'This control is convenient for selecting ranges.  For example, this can be used for specifying a time range'),
      example: this._renderRangeSelector()
    });
  }
};
