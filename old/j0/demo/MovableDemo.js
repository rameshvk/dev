'use strict';

require('./MovableDemo.less');
import BaseComponent from '../ux/BaseComponent.js';
import React from 'react';
import Demo from './Demo';
import DemoDescription from './DemoDescription.js';
import Movable from '../ux/Movable.js';
import MovableModel from '../ux/models/MovableModel.js';


export default class MovableDemo extends BaseComponent {
  constructor(props) {
    super(props);
    this._movableModel = new MovableModel({x:0, y:0});
    this.state = {changing: false};
    this._movableModel
      .on('change', () => {
        if (!this.state.changing) this.setState({changing: true});
      })
      .on('cancel', () => this.setState({changing: false}))
      .on('submit', () => this.setState({changing: false}));
  }

  componentWillUnmount() {
    this._movableModel.cancel();
  }

  renderContent() {
    return React.DOM.div(
      {className: 'movable-demo'},
      Movable.create(
        {model: this._movableModel},
        React.DOM.div(
          {className: 'movable-rect' + (this.state.changing ? ' changing' : '')}
        )
      )
    );
  }

  render() {
    return Demo.create(
      {title: 'Component ux.Movable'},
      DemoDescription.create({}, 'Used to render an object that can be moved around.'),
      DemoDescription.create({}, 'Click on the gray square and drag it around.  It should move well'),
      this.renderContent()
    );
  }
}
