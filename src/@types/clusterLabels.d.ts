interface ILabelChange {
  key: string;
  value: string | null;
  replaceLabelWithKey?: string;
}

interface ILabelChangeRequest extends ILabelChange {
  clusterId: string;
}
