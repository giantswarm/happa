// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AthenaAnalyticsPayload = Record<string, any>;

export interface IAthenaAnalyticsEventInput<T extends AthenaAnalyticsPayload> {
  appID: string;
  sessionID: string;
  payloadType: string;
  payloadSchemaVersion: number;
  uri: string;
  payload: T;
}

export interface IAthenaAnalyticsEvent<T extends AthenaAnalyticsPayload> {
  appID: string;
  sessionID: string;
  payloadType: string;
  payloadSchemaVersion: number;
  uri: string;
  payload: T;
  timestamp: string;
  installationID: string;
  environmentClass: string;
}
