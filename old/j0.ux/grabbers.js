'use strict';

require('./grabbers.less');
const React = require('react');

function renderGrabber(key, className, contents, tooltip) {
  return React.DOM.div(
    {key, className},
    contents || null,
    tooltip ? React.DOM.span({className: 'tooltip'}, tooltip) : null
  );
};

function renderLeftEllipsisGrabber(tooltip) {
  return renderGrabber('grabber-left', 'grabber left', '···', tooltip);
};

function renderRightEllipsisGrabber(tooltip) {
  return renderGrabber('grabber-right', 'grabber right', '···', tooltip);
};

function renderCenterEllipsisGrabber(tooltip) {
  return renderGrabber('grabber-center', 'grabber center', '···', tooltip);
};

function renderLeftBlockGrabber(tooltip) {
  return renderGrabber('grabber-left', 'grabber left block', '', tooltip);
};

function renderRightBlockGrabber(tooltip) {
  return renderGrabber('grabber-right', 'grabber right block', '', tooltip);
};

function renderCenterBlockGrabber(tooltip) {
  return renderGrabber('grabber-center', 'grabber center block', '', tooltip);
};

export let Ellipsis = {
  left: {render: renderLeftEllipsisGrabber},
  right: {render: renderRightEllipsisGrabber},
  center: {render: renderCenterEllipsisGrabber}
};

export let Block = {
  left: {render: renderLeftBlockGrabber},
  right: {render: renderRightBlockGrabber},
  center: {render: renderCenterBlockGrabber}
};
