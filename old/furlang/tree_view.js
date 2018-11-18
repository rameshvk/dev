'use strict';

const React = require('react');

class TreeView extends React.Component {
  static get propTypes() {
    return {
      title: React.PropTypes.any.isRequired,
    };
  }

  constructor(props) {
    super(props);
    this.state = {expanded: false};
  }

  render() {
    const icon = React.Children.count(this.props.children) > 0 && React.DOM.button({
      style: {border: 0, padding: 2, marginRight: 6, background: 'none', cursor: 'pointer', color: 'rgb(120, 120, 120)'},
      onClick: () => this.setState({expanded: !this.state.expanded}),
      children: this.state.expanded ? '~' : '>'
    });
    return React.DOM.div(
      {},
      React.DOM.div({}, icon, this.props.title),
      this.state.expanded && React.DOM.div({
        style: {paddingLeft: 14},
        children: this.props.children
      })
    );
  }
}

exports.TreeView = TreeView;
