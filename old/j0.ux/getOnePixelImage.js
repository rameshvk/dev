'use strict';

function encodeTriplet(e1, e2, e3) {
  const keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  const enc1 = e1 >> 2;
  const enc2 = ((e1 & 3) << 4) | (e2 >> 4);
  const enc3 = ((e2 & 15) << 2) | (e3 >> 6);
  const enc4 = e3 & 63;
  return keyStr.charAt(enc1) + keyStr.charAt(enc2) + keyStr.charAt(enc3) + keyStr.charAt(enc4);
}

export default function getOnePixelImage(r, g, b) {
  const color = encodeTriplet(0, r, g) + encodeTriplet(b, 255, 255);
  return `url(data:image/gif;base64,R0lGODlhAQABAPAA${color}/yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==)`;
}
