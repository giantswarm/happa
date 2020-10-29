interface IRum {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addUserAction<T extends Record<string, any>>(
    actionName: string,
    value: T
  ): void;
}

interface Window {
  DD_RUM?: IRum;
}
