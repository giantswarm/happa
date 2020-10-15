const eventNameSeparator = '_';

export function mergeEventNames(...parts: string[]): string {
  return parts.join(eventNameSeparator).toUpperCase();
}
