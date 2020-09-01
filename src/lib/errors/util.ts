/**
 * Assert if a custom error is of a certain type.
 * @param name - Error name.
 * @param error - Error object.
 */
export function is(name: string, error: Error) {
  return error.name === name;
}
