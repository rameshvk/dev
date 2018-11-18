'use strict';

const {parse, SyntaxError} = require('./furlang');

describe('Furlang', () => {
  test('parses a complicated expression', () => {
    expect(parse('a.b', {startRule: 'Program'}))
      .toEqual({h: 32});
  });
});
