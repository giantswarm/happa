// This file is not meant to be a nonsense hodgepodge of functions that we don't know
// where to store, instead it is a file where we store little utility functions that
// can be used and *reused* in broad contexts, eg string or date transformers, methods
// for calculations, etc.

/**
 * Returns a trimmed string
 * @param {Number} numChars the maximum number of characters the string can have
 * @param {String} string the string to be trimmed
 */
export const trimStringBy = (numChars, string) => {
  const ellipsis = string.length > numChars ? String.fromCharCode(8230) : '';
  return `${string.substr(0, numChars)}${ellipsis}`;
};
