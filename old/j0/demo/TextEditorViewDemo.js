'use strict';

import BaseComponent from '../ux/BaseComponent';
import React from 'react';
import ReactDOM from 'react-dom';
import Demo from './Demo';
import DemoDescription from './DemoDescription.js';
import TextEditorView from '../ux/editor/TextEditorView';
import TextSelection from '../ux/editor/TextSelection.js';
import TextView from '../ux/editor/TextView';
import bacon from './bacon';

require('./TextEditorViewDemo.less');

export default class TextEditorViewDemo extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {
      isActive: false,
      selection: new TextSelection({
        anchorId: 'xid2',
        anchorOffset: 4,
        anchorWrapped: false,
        focusId: 'xid2',
        focusOffset: 8,
        focusWrapped: false,
      })
    };
    this._onActivate = () => this.onActivate();
  }

  onActivate() {
    this.setState({isActive: true});
  }

  render() {
    const onActivate = this._onActivate;
    const isActive = this.state.isActive;
    const selection = this.state.selection;

    return Demo.create(
      {title: 'Component ux.editor.TextEditorView'},
      React.DOM.div(
        {},
        DemoDescription.create({}, 'Use this to render a TextEditor'),
        DemoDescription.create({}, 'Children nodes can be TextView or any other non-selectable items.'),
        TextEditorView.create(
          {className: 'scroll-container', selection, isActive, onActivate},
          TextView.create({
            className: 'hello',
            text: 'Some Samnple Text\n\n',
            style: {fontWeight: 'bold'},
            id: 'xid1',
            rgap: true,
          }),
          React.DOM.div({style: {
            display: 'inline-block',
            width: 100,
            height: 100,
            background: 'pink'
          }}),
          TextView.create({
            text: 'Some other text here',
            style: {},
            id: 'xid2',
            lgap: true,
          }),
          TextView.create({
            text: 'And this is the a green line',
            style: {color: 'green'},
            id: 'xid4'
          }),
          React.DOM.div(
            null,
            TextView.create({
              text: 'And this line starts with a block yo',
              style: {color: 'blue'},
              id: 'xid5'
            })
          ),
          React.DOM.div(
            null,
            TextView.create({
              text: bacon,
              style: {background: 'lightblue'},
              id: 'xid6'
            })
          )
        )
      )
    );
  }
};
