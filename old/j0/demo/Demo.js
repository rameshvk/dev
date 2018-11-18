'use strict';

require('./Demo.less');
import React from 'react';
import BaseComponent from '../ux/BaseComponent.js';
import Selector from '../ux/Selector.js';
import SelectorModel from '../ux/models/SelectorModel.js';
import TogglerView from '../ux/TogglerView.js';

const Chevron = (symbol, onToggle) => TogglerView.create(
  {key: 'toggler', onToggle},
  React.DOM.span({className: 'demo-chevron', key: 'chevron'}, symbol)
);

const ChevronUp = onToggle => Chevron('△', onToggle);
const ChevronDown = onToggle => Chevron('▽', onToggle);

export default class Demo extends BaseComponent {
  constructor(props) {
    super(props);
    this._selectorModel = new SelectorModel(this.props.initialOptionIndex);
    this._toggle = () => this._selectorModel.next();
  }

  renderExpanded() {
    const children = this.props.children;
    return this.renderContractedWithContent(
      React.DOM.div({className: 'demo-contents', key: 'demo-contents', children})
    );
  }

  renderContractedWithContent(contents) {
    return React.DOM.div(
      {className: 'demo-title', key: 'demo-title'},
      this.props.title,
      Selector.create(
        {model: this._selectorModel, key: 'toggler-selector'},
        ChevronDown(this._toggle),
        ChevronUp(this._toggle)
      ),
      contents
    );
  }

  renderContracted() {
    return this.renderContractedWithContent(null)
  }

  render() {
    return React.DOM.div(
      {className: 'demo'},
      Selector.create(
        {model: this._selectorModel, key: 'selector'},
        this.renderContracted(),
        this.renderExpanded()
      )
    );
  }
};
