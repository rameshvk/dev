'use strict';

const {isTerminal} = require('./rewrite');
const {applyRewriteRules} = require('./rules');
const {parse} = require('./parser');
const {ParsedView} = require('./parsed_view');
const {TreeView} = require('./tree_view');

const React = require('react');
const _ = require('lodash');

class DemoView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {input: '', error: null, result: null, rewritten: null, epoch: 1};
    this._onChange = ee => {
      const input = ee.target.value;
      let error = null;
      let result = null;
      let rewritten = null;
      try {
        const parsed = parse(input);
        result = parsed;
        rewritten = applyRewriteRules(parsed);
      } catch(e) {
        error = e.message;
      }
      this.setState({input, error, result, rewritten, epoch: this.state.epoch + 1});
    };
  }

  render() {
    const {input, error, result, rewritten, epoch} = this.state;
    return React.DOM.div(
      {style: {width: '100%', height: '100%', boxSizing: 'border-box', padding: 20}},
      React.DOM.p(
        {},
        'This is a playground to understand a new parser built for a fun little language.  The language is modeled a little on Erlang (hence the name Furlang) -- it is intended to be functional and reactive.'
      ),
      React.DOM.textarea({
        placeholder: 'Please type an expression to parse',
        value: input,
        onChange: this._onChange,
      }),
      React.DOM.div({
        style: {display: 'inline-block', width: '10%'}
      }),
      React.DOM.div(
        {className: 'results-pane'},
        error && renderError(error),
        React.DOM.h1({key: 'live'}, 'Annotated Input'),
        React.createElement(ParsedView, {key: 'pp', input, parsed: rewritten, epoch}),
        React.DOM.h1({key: 'title'}, 'Parse tree'),
        result && renderTreeView(result),
        React.DOM.h1({key: 'title2'}, 'Rewritten tree'),
        rewritten && renderTreeView(rewritten)
      )
    );
  }
}

function renderError(error) {
  return React.DOM.div({style: {color: 'red'}}, error);
}

function renderTreeView(value) {
  if (value === null) {
    return null;
  }
  const values = Array.isArray(value.value) ? value.value : [value.value];
  const children = isTerminal(value) ? [] : _.map(values, renderTreeView);
  const text = value.type === 'error' ? value.error : (isTerminal(value) ? JSON.stringify(value.value) : value.type);
  const onClick = () => {
    const elt = document.querySelector('textarea');
    elt.focus();
    elt.setSelectionRange(value.loc[0], value.loc[1]);
  };
  const title = React.DOM.a({href: '#', children: text, onClick});
  return React.createElement(TreeView, {title}, ...children);
}

exports.DemoView = DemoView;
