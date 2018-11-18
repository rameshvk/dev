'use strict';

const React = require('react');
const ReactDOM = require('react-dom');
import Examples from './Examples.js';

function main() {
  ReactDOM.render(
    React.createElement(Examples),
    document.getElementById('container')
  );
}

main();
