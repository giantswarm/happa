export const trimStringBy = (numChars, string) => {
  const ellipsis =
    string.length > numChars - 1 ? String.fromCharCode(8230) : '';
  return `${string.substr(0, numChars - 1)}${ellipsis}`;
};
