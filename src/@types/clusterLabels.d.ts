interface IClusterLabelMap {
  [key: string]: string;
}

interface ILabelChange {
  key: string;
  value: string | null;
  replaceLabelWithKey?: string;
}
