'use strict';

const React = require('react');
import Movable from '../Movable.js';
import renderExample from './renderExample.js';

export default class MovableExample extends React.Component {
  constructor(props) {
    super(props);
    this.state = {start: null, current: null};
    this._movableModel = Movable.createModel()
      .on('move-start', (start, current) => this.setState({start, current}))
      .on('move', (start, current) => this.setState({start, current}))
      .on('move-end', (start, current) => true)
      .on('move-cancel', (start, current) => this.setState({start:null, current:null}));
  }

  componentWillUnmount() {
    this._movableModel.removeAllListeners();
  }

  _renderGrabber() {
    let top = 0, left = 0;
    if (this.state.start && this.state.current) {
      top = this.state.current.y - this.state.start.y;
      left = this.state.current.x - this.state.start.x;
    }

    const style = {
      position: 'relative',
      top, left,
      display: 'inline-block',
      background: 'beige',
      userSelect: 'none',
      WebkitUserSelect: 'none',
      cursor: 'move'
    };
    return React.DOM.div({key: 'grabber', style}, 'Grab and Move this');
  }

  render() {
    return renderExample({
      title: 'Movable',
      oneLiner: 'Implements ability to track mouse movements and use that to move component',
      details: React.DOM.div(
        null,
        'The demo below shows how a component can be moved around very simply by using the Movable class.',
        'Note that you can hit escape during a move and it will cancel the move.'
      ),
      example: React.createElement(Movable, {model: this._movableModel}, this._renderGrabber())
    });
  }
};
