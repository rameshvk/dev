'use strict';

function getViewportOffsets() {
  const body = document.body, doc = document.documentElement;
  return {x: body.scrollLeft + doc.scrollLeft, y: body.scrollTop + doc.scrollTop};
}

export function toViewportCoordinates(point) {
  const viewport = getViewportOffsets();
  return {x: point.x - viewport.x, y: point.y - viewport.y};
}

export function toDocumentCoordinates(point) {
  const viewport = getViewportOffsets();
  return {x: point.x + viewport.x, y: point.y + viewport.y};
}
