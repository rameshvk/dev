'use strict';

var _ = require('lodash');

function rewrite(value, typeRules) {
  if (!value) return value;

  let rule, val = value;
  do {
    const context = {};
    rule = _.find(typeRules[val.type], rule => rule.matches(val, context));
    if (rule) {
      const newVal = rule.rewrite(val, context);
      if (_.isEqual(newVal, val)) rule = null;
      else val = newVal;
    }
  } while (rule != null);

  if (isTerminal(val)) return val;

  let result = null;
  if (_.isArray(val.value)) {
    result = _.map(val.value, vv => rewrite(vv, typeRules));
  } else {
    result = rewrite(val.value, typeRules);
  }
  return Object.assign({}, val, {value: result});
}

const terminalTypes = {
  integer: true,
  boolean: true,
  string: true,
  id: true,
  decimal: true,
};

const nonTerminalErrors = {
  'Missing )' : true,
  'Invalid use of dot operator': true,
  'Missing operator': true
};

function isTerminal(val) {
  return terminalTypes[val.type] || (isError(val) && !nonTerminalErrors[val.error]);
}

function isError(val) {
  return val.type === 'error';
}

function isMissingTerm(val) {
  return val.type === 'error' && val.error === 'Missing term';
}

function isOps(val) {
  return !isError(val) && !isTerminal(val);
}

exports.rewrite = rewrite;
exports.isTerminal = isTerminal;
exports.isError = isError;
exports.isMissingTerm = isMissingTerm;
exports.isOps = isOps;
