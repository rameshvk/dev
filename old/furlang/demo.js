'use strict';

const React = require('react');
const ReactDOM = require('react-dom');
const {DemoView} = require('./demo_view');

function main() {
  const container = document.getElementById('root');
  ReactDOM.render(React.createElement(DemoView), container);
}

//const {parse} = require('./parser.js');
//const {getErrorHtml} = require('./furlang_error_html');
//const {encode} = require('he');

function oldmain() {
  const inputElement = document.getElementById('input');
  const outputElement = document.getElementById('output');
  inputElement.addEventListener('input', onChange);

  function onChange() {
    const input = inputElement.value;
    let errorHtml = '';
    try {
      const output = parse(input, {startRule: 'Program'});
      errorHtml = getErrorHtml(input, output);
    } catch (e) {
      console.log('Exception', e);
      errorHtml = `<span style="font-weight: bold; color: red;">` + encode(e.message) + '</span>';
    }
    console.log('Error =', errorHtml);
    outputElement.innerHTML = errorHtml;
  }
}

main();
