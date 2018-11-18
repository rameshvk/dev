'use strict';

const React = require('react');
import Toggle from '../Toggle.js';
import Toggler from '../Toggler.js';
import renderExample from './renderExample.js';

const TextOptions = ['State One', 'State Two', 'State Three', 'State Four', 'State Five'];
export default class ToggleExample extends React.Component {
  constructor(props) {
    super(props);
    this.state = {showIndex: 0};
    this.onChangeIndex = showIndex => this.setState({showIndex});
  }

  _renderOption(text, index) {
    const onChange = this.onChangeIndex, key = text;
    return React.createElement(
      Toggler,
      {initIndex: index, maxIndex: TextOptions.length, onChange, key},
      text + '- Click here to move to next state, Shift Click to move back'
    );
  }

  _renderExample() {
    return React.createElement(
      Toggle,
      {showIndex: this.state.showIndex},
      TextOptions.map((text, index) => this._renderOption(text, index))
    );
  }

  render() {
    return renderExample({
      title: 'Toggle',
      oneLiner: 'implements ability to cycle through different states',
      details: React.DOM.div(
        null,
        'The most basic use case of this is for showing and hiding elements. ',
        'The chevron based show/hide state for this Examples page is actually built with Toggle. ',
        'But it can also be used to render multi-state icons for instance.  The following example cycles through multiple texts.',
        'You can press click to move forward and press shift-click to move back.'
      ),
      example: this._renderExample()
    });
  }
};
