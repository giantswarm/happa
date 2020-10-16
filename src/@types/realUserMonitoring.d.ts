interface IRum {
  addUserAction: (actionName: string, value: Record<string, unknown>) => void;
}

interface Window {
  DD_RUM?: IRum;
}
