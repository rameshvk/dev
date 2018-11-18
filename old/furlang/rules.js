'use strict';

const {isMissingTerm, isTerminal, isError, rewrite} = require('./rewrite');

function applyRewriteRules(value) {
  const rules = getStandardRewriteRules();
  // rewrite twice since there is no capture/bubble phase separated out
  return rewrite(rewrite(value, rules), rules);
}

function getStandardRewriteRules() {
  const rules = {};
  const addRule = (type, matches, rewrite) => {
    rules[type] = rules[type] || [];
    rules[type].push({matches, rewrite});
  }
  addRule('adjacency', isFunctionCall, rewriteToFunctionCall);
  addRule('adjacency', isMissingOperator, rewriteToMissingOperator);
  addRule('.', isDecimal, rewriteToDecimal);
  addRule('.', isInvalidDotUsage, rewriteToInvalidDotUsageError);
  return rules;
}

function isFunctionCall(val, unusedContext) {
  return val.value[1].type === '()';
}

function rewriteToFunctionCall(val, unusedContext) {
  return {
    value: [val.value[0], val.value[1].value],
    type: 'call',
    loc: val.value[1].loc
  };
}

function isDecimal(val, unusedContext) {
  return (val.value[0].type === 'integer' && val.value[1].type === 'integer') ||
    (isMissingTerm(val.value[0]) && val.value[1].type === 'integer') ||
    (val.value[0].type === 'integer' && isMissingTerm(val.value[1]));
}

function rewriteToDecimal(val, unusedContext) {
  const loc = [val.value[0].loc[0], val.value[1].loc[1]];
  let value = null;

  if (val.value[0].type === 'integer' && val.value[1].type === 'integer') {
    value = (val.value[0].value + '.' + val.value[1].value).replace(/ /g, '');
  } else if (isMissingTerm(val.value[0])) {
    value = ('0.' + val.value[1].value).replace(/ /g, '');
  } else {
    value = (val.value[0].value + '.0').replace(/ /g, '');
  }
  return {type: 'decimal', value, loc};
}

function isMissingOperator(val, unusedContext) {
  return !isError(val.value[0]) && !isError(val.value[1]);
}

function rewriteToMissingOperator(val, unusedContext) {
  return {type: 'error', error: 'Missing operator', value: val.value, loc: val.loc};
}

function isInvalidDotUsage(val, unusedContext) {
  const isValid = term => isError(term) || !isTerminal(term) || (term.type === 'id' || term.type === 'string');
  return !isValid(val.value[0]) || !isValid(val.value[1]);
}

function rewriteToInvalidDotUsageError(val, unusedContext) {
  return {type: 'error', error: 'Invalid use of dot operator', value: val.value, loc: val.loc};
}

exports.applyRewriteRules = applyRewriteRules;
