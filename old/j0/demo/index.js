'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import Demos from './Demos';

function main() {
  ReactDOM.render(
    React.createElement(Demos),
    document.getElementById('container')
  );
}

main();
