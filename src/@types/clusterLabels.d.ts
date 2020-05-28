interface ILabelChange {
  key: string;
  value: string | null;
}

interface ILabelChangeRequest extends ILabelChange {
  clusterId: string;
}
