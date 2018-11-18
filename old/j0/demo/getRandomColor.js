'use strict';

import RandomColors from './RandomColors.json';

export default function getRandomColor(index) {
  const color = RandomColors[index % RandomColors.length];
  const r = color % 256, rest = (color - r) / 256;
  const g = rest % 256;
  const b = (rest - g) / 256;
  return `rgb(${r}, ${g}, ${b})`;
};
