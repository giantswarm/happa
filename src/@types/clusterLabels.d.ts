interface IClusterLabelMap {
  [key: string]: string;
}

interface ILabelChange {
  key: string;
  value: string | null;
  replaceLabelWithKey?: string;
}

interface IClusterLabelWithDisplayInfo {
  key: string;
  value: string;
  displayKey: string;
  displayValue: string;
  textColor?: string;
  backgroundColor?: string;
}
