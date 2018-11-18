'use strict';

const {encode} = require('he');
module.exports.getErrorHtml = getErrorHtml;

/**
 * getErrorHtml takes the output of parsing a specific input and generates a friendly
 * rendering of the error.
 * It handles the following error types:
 * 1.  Missing ). The fix for this is to insert a close parenthesis at the designated spot
 * 2.  Missing term.  The fix is to insert a term at the designated spot.
 * 3.  Missing operator.  The fix is ot insert an operator at the designated spot.
 *
 * It does this by collecting all the reported errors and squeezing all the inserts needed.
 * It also colorizes the input by choosing special colors for ids and chipifying strings.
 *
 * returns an empty string if there was no error
 */
function getErrorHtml(input, parseResult) {
  const offsets = getOffsets(parseResult);
  let hasErrors = false;
  const offsetsMap = {};
  for (let kk = 0; kk < offsets.length; kk ++) {
    const item = offsets[kk];
    const {offset, beginHtml, html, endHtml} = item;
    if (!offsetsMap[offset]) offsetsMap[offset] = {beginHtml: [], html: [], endHtml: []};
    if (beginHtml) offsetsMap[offset].beginHtml.push(beginHtml);
    if (html) {
      hasErrors = true;
      offsetsMap[offset].html.push(html);
    }
    if (endHtml) offsetsMap[offset].endHtml.push(endHtml);
  }
  if (!hasErrors) return '';
  const keys = Object.keys(offsetsMap).sort((a, b) => a - b);
  let result = `<span style="whitespace: pre-wrap">`, last = 0;

  if (+keys.slice(-1)[0] < input.length) keys.push(input.length);
  for (let kk = 0; kk < keys.length; kk ++) {
    const offset = keys[kk];
    result += encode(input.slice(last, offset));
    if (offsetsMap[offset]) {
      result += offsetsMap[offset].html.join('');
      result += offsetsMap[offset].endHtml.join('');
      result += offsetsMap[offset].beginHtml.join('');
    }
    last = offset;
  }
  return result + '</span>';
}

const ops = {
  '.': true,
  '*': true,
  '/': true,
  '+': true,
  '-': true,
  '<=': true,
  '<': true,
  '>=': true,
  '>': true,
  '=': true,
  '!=': true,
  'and': true,
  'or': true
};

const missingTermHtml = `<span style="color: red" title="Missing term">?</span>`;
const missingParenHtml = `<span style="color: green" title="Missing )">)</span>`;
const missingOperatorHtml = `<span style="color: red" title="Missing operator">&#8853;</span>`;
const beginStringHtml = `<span style="color: lightblue">`;
const endStringHtml = `</span>`;
const beginBooleanHtml = `<code style="color: gray">`;
const endBooleanHtml  = `</code>`;
const beginIdHtml = `<span style="color: blue">`;
const endIdHtml = `</span>`;

function getOffsets(result) {
  let html = '';

  if (result.type === 'error') {
    if (result.error === 'Missing )') {
      html = missingParenHtml;
      return getOffsets(result.value).concat([{offset: result.loc[1], html}]);
    } else if (result.error === 'Missing term') {
      html = missingTermHtml;
      return [{offset: result.loc[0], error: result.error}];
    }
  } else if (result.type === 'adjacency') {
    html = missingOperatorHtml;
    return getOffsets(result.value[0])
      .concat([{offset: result.loc[0], html}])
      .concat(getOffsets(result.value[1]));
  }

  if (ops[result.type]) {
    return getOffsets(result.value[0]).concat(getOffsets(result.value[1]));
  }

  switch(result.type) {
  case 'string':
    return [
      {offset: result.loc[0], beginHtml: beginStringHtml},
      {offset: result.loc[1], endHtml: endStringHtml}
    ];
  case 'boolean':
    return [
      {offset: result.loc[0], beginHtml: beginBooleanHtml},
      {offset: result.loc[1], endHtml: endBooleanHtml}
    ];
  case 'id':
    return [
      {offset: result.loc[0], beginHtml: beginIdHtml},
      {offset: result.loc[1], endHtml: endIdHtml}
    ];
  }
  return [];
}
