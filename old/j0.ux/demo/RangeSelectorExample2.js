'use strict';

const React = require('react');
import RangeSelector from '../RangeSelector.js';
import renderExample from './renderExample.js';
import {Block as BlockGrabber} from '../grabbers.js';

function normalizeOne(x) {
  return Math.max(Math.min(x, 100), 0);
};

function normalize({start, end}) {
  const nStart = normalizeOne(start), nEnd = normalizeOne(end);
  return {start: Math.min(nStart, nEnd), end: Math.max(nStart, nEnd)};
};

export default class RangeSelectorExample2 extends React.Component {
  constructor(props) {
    super(props);
    this.state = {start: 40, end: 60};
    this._onChange = (start, end) => this.setState(normalize({start, end}));
    this._grabber = {
      left: {render: () => BlockGrabber.left.render(this._renderTooltip(this.state.start))},
      right: {render: () => BlockGrabber.right.render(this._renderTooltip(this.state.end))}
    };
  }

  _renderTooltip(percentage) {
    return React.DOM.div(
      {style: {
        position: 'absolute',
        marginTop: '22px',
        lineHeight: '20px',
        right: '0',

        width: '100px',
        marginRight: '-50px',

        outline: '1px solid rgb(200, 200, 200)',
        whitespace: 'pre',
        textAlign: 'center',

        fontSize: '15px',
        color: 'black',
        background: 'rgba(255, 255, 255, 0.7)'
      }},
      Math.floor(percentage) + '%'
    );
  }

  _renderRangeSelector() {
    const startPercentage = this.state.start;
    const endPercentage = this.state.end;
    const onChange = this._onChange;
    const grabber = this._grabber;

    return React.createElement(RangeSelector, {startPercentage, endPercentage, onChange, grabber});
  }

  render() {
    return renderExample({
      title: 'Range Selector Advanced Usage',
      oneLiner: 'shows non-default grabber with tooltips',
      details: React.DOM.div(null, 'This example uses a non-default grabber which allows the ability to provide tooltips that change with position, for example'),
      example: this._renderRangeSelector()
    });
  }
};
