const eventNameSeparator = '_';

export function mergeActionNames(...parts: string[]): string {
  return parts.join(eventNameSeparator).toUpperCase();
}
