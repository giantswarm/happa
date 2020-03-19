/**
 * Assert if a custom error is of a certain type
 * @param {string} name - Error name
 * @param {Error} error - Error object
 */
export function is(name, error) {
  return error.name === name;
}
