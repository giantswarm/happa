declare module 'get-contrast' {
  export function ratio(
    colorOne: string,
    colorTwo: string,
    options?: { ignoreAlpha: boolean }
  ): number;
}
