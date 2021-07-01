declare module '*.md';

type GlobalEnvironment = 'development' | 'kubernetes' | 'docker-container';

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
  mapiAuthAdminGroup: string;
  sentryDsn: string;
  sentryEnvironment: string;
  sentryReleaseVersion: string;
  sentryDebug: boolean;
  sentrySampleRate: number;
}

interface IFeatureFlags {
  FEATURE_MAPI_AUTH: boolean;
  FEATURE_MAPI_CLUSTERS: boolean;
  FEATURE_MONITORING: boolean;
}

interface Window {
  config: IGlobalConfig;
  featureFlags: IFeatureFlags;
}
