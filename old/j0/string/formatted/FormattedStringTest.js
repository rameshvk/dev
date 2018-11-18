'use strict';

import {assert} from 'chai';
import {FlowModes, FormattedString, FormattedSegment} from './FormattedString';

describe('Formatted String', () => {
  it('creates <empty>', () => {
    const formatted = new FormattedString();
    assert.equal(formatted.toString(), '');
  });

  it('create regular strings', () => {
    const formatted = new FormattedString('Hello');
    assert.equal(formatted.toString(), 'Hello');
  });

  it('appends strings', () => {
    let formatted = new FormattedString('Hello');
    formatted = formatted.append(' World').append(new FormattedString(', yo'));
    assert.equal(formatted.toString(), 'Hello World, yo');
  });

  it('slices strings', () => {
    const formatted = new FormattedString('Hello');
    let sliced = formatted.slice(0, 3);
    assert.equal(sliced.toString(), 'Hel');
    sliced = formatted.slice(2, 10);
    assert.equal(sliced.toString(), 'llo');
  });

  it('splices strings', () => {
    const attempts = [
      // pure delete case
      {initial: 'hello world', start: 6, deleteCount: 5, inserts: []},
      // pure append case
      {initial: 'hello', start: 5, deleteCount: 0, inserts: [' world']},
      {initial: 'hello', start: 5, deleteCount: 0, inserts: [' ', 'world']},
      // pure prepend case
      {initial: 'world', start: 5, deleteCount: 0, inserts: ['hello ']},
      {initial: 'hello', start: 5, deleteCount: 0, inserts: ['hello', ' ']},
      // pure insert case
      {initial: 'goodbye, world', start: 9, deleteCount: 0, inserts: ['cruel ']},
      {initial: 'goodbye, world', start: 9, deleteCount: 0, inserts: ['cruel', ' ']},

      // more complicated cases
      {initial: 'hello', start: 0, deleteCount: 1, inserts: ['g']},
      {initial: 'hello', start: 0, deleteCount: 2, inserts: ['g', 'e']},
      {initial: 'hello world', start: 5, deleteCount: 10, inserts: [' ', 'goodbye']},
      {initial: 'hello', start: 4, deleteCount: 1, inserts: []}
    ];
    attempts.forEach(({initial, start, deleteCount, inserts}) => {
      const formatted = new FormattedString(initial);
      const {spliced} = formatted.splice(start, deleteCount, ...inserts);
      const strSpliced = initial.slice(0, start) + inserts.join('') + initial.slice(start + deleteCount);
      assert.equal(spliced.toString(), strSpliced, 'Failed case: ' + JSON.stringify({initial, start, deleteCount, inserts}));
    });
  });

  it('applies styles', () => {
    const formatted = new FormattedString('Hello World');
    const styled = formatted.applyStyle(6, 9, renderInfo => Object.assign({}, renderInfo, {fontWeight: 'bold'}));
    assert.equal(formatted.toString(), styled.toString());
    assert.equal(styled._segments.length, 3);
    assert.deepEqual(styled._segments[0].renderInfo, {});
    assert.deepEqual(styled._segments[0].toString(), 'Hello ');
    assert.deepEqual(styled._segments[1].renderInfo, {fontWeight: 'bold'});
    assert.deepEqual(styled._segments[1].toString(), 'Wor');
    assert.deepEqual(styled._segments[2].renderInfo, {});
    assert.deepEqual(styled._segments[2].toString(), 'ld');
  });

  it('applies styles with merge', () => {
    const formatted = new FormattedString('Hello World');
    const styled = formatted.applyStyle(6, 9, {fontWeight: 'bold'}).applyStyle(0, 11, {fontStyle: 'italics'});
    assert.equal(formatted.toString(), styled.toString());
    assert.equal(styled._segments.length, 3);
    assert.deepEqual(styled._segments[0].renderInfo, {fontStyle: 'italics'});
    assert.deepEqual(styled._segments[0].toString(), 'Hello ');
    assert.deepEqual(styled._segments[1].renderInfo, {fontWeight: 'bold', fontStyle: 'italics'});
    assert.deepEqual(styled._segments[1].toString(), 'Wor');
    assert.deepEqual(styled._segments[2].renderInfo, {fontStyle: 'italics'});
    assert.deepEqual(styled._segments[2].toString(), 'ld');
  });
});
