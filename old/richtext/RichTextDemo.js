'use strict';

const React = require('react');
const ReactDOM = require('react-dom');
const _ = require('lodash');
const {RichTextCore, InlineObjectPart, BlockObjectPart, TextPart} = require('./RichTextCore');

class RichTextDemo extends React.PureComponent {
  constructor(props) {
    super(props);
    this._root = null;
    const ref = nn => this._root = nn;
    this.state = {
      attributes: {style: {wordBreak: 'break-all', whiteSpace: 'pre-wrap'}, ref},
      isEditable: false,
      children: [
        React.createElement(TextPart, {text: 'hello\nworld', attributes: {style: {color: 'red'}}}),
        React.createElement(BlockObjectPart, {attributes: {style: {display: 'inline-block', background: 'blue', width: 120, height: 100}}}, 'x'),
        React.createElement(BlockObjectPart, {attributes: {style: {display: 'inline-block', background: 'cyan', width: 120, height: 100}}}, 'z'),
        React.createElement(TextPart, {text: 'this is a very long third line just to see how things stand', attributes: {style: {color: 'green', fontSize: '200%'}}})
      ],
      selectionRects: [],
      caretRect: null,
    };
    this._onSelect = () => {
      if (this.state.selectionRects.length) this.setState({selectionRects: []});
      else {
        const start = +this.refs.start.value, end = +this.refs.end.value;
        this.setState({selectionRects: RichTextCore.getLineRectsForRange(this._root, start, end)});
      }
    };
    this._onClick = ee => {
      const pointInfo = RichTextCore.getPointInfo(this._root, ee.clientX, ee.clientY);
      const caretRects = RichTextCore.getCaretRects(this._root, pointInfo.offset);
      const rect = caretRects[Number(!pointInfo.isLeft)] || caretRects[0];
      this.setState({caretRect: rect});
    };
  }

  render() {
    const {top, left, width, height} = this.state.caretRect || {};
    return React.DOM.div(
      {},
      React.DOM.div(
        {onClick: this._onClick},
        React.createElement(RichTextCore, this.state)
      ),
      React.DOM.input({ref: 'start'}),
      React.DOM.input({ref: 'end'}),
      React.DOM.button({onClick: this._onSelect}, 'Toggle Selection Rects'),
      _.map(this.state.selectionRects, ({left, right, top, bottom, width, height}, key) => {
        return React.DOM.div({key, style: {
          position: 'absolute', top, left, width, height,
          display: 'inline-block',
          background: 'rgba(255, 60, 255, 0.3)',
          border: (width < 1) ? '1px solid red' : 'none',
        }});
      }),
      this.state.caretRect && React.DOM.div({key: 'caretRect', style: {
        position: 'absolute', top, left, width, height,
        display: 'inline-block',
        border: '1px solid blue',
        outline: '1px solid blue'
      }})
    );
  }

  static initialize() {
    document.addEventListener('DOMContentLoaded', () => {
      const root = document.createElement('div');
      document.body.appendChild(root);
      ReactDOM.render(React.createElement(this), root);
    });
  }
}

RichTextDemo.initialize();
