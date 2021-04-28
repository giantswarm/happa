declare module '*.md';

enum GlobalEnvironment {
  Dev = 'development',
  Kubernetes = 'kubernetes',
  Docker = 'docker-container',
}

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
}

interface IFeatureFlags {
  FEATURE_MAPI_AUTH: boolean;
}

interface Window {
  config: IGlobalConfig;
  featureFlags: IFeatureFlags;
}
