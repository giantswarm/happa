declare module 'web-vitals' {
  export interface Metric {
    name: 'CLS' | 'FCP' | 'FID' | 'LCP' | 'TTFB';
    value: number;
    delta: number;
    id: string;
    isFinal: boolean;
    entries: PerformanceEntry[];
  }

  export interface ReportHandler {
    (metric: Metric): void;
  }

  export declare function getCLS(
    onReport: ReportHandler,
    reportAllChanges?: boolean
  ): void;

  export declare function getFCP(onReport: ReportHandler): void;

  export declare function getFID(onReport: ReportHandler): void;

  export declare function getLCP(
    onReport: ReportHandler,
    reportAllChanges?: boolean
  ): void;

  export declare function getTTFB(onReport: ReportHandler): void;
}
