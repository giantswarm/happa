declare module '*.md';

interface IGlobalConfig {
  apiEndpoint: string;
  audience: string;
  awsCapabilitiesJSON: string;
  azureCapabilitiesJSON: string;
  mapiEndpoint: string;
  mapiAudience: string;
  defaultRequestTimeoutSeconds: number;
  enableRealUserMonitoring: boolean;
  environment: GlobalEnvironment;
  happaVersion: string;
  ingressBaseDomain: string;
  passageEndpoint: string;
  mapiAuthRedirectURL: string;
}

interface IFeatureFlags {
  FEATURE_MAPI_AUTH: boolean;
}

interface Window {
  config: IGlobalConfig;
  featureFlags: IFeatureFlags;
}
