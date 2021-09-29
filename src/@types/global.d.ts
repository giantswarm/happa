declare module '*.md';

type GlobalEnvironment = 'development' | 'kubernetes' | 'docker-container';

interface IGlobalConfig {
  apiEndpoint: string;
  audience: string;
  awsCapabilitiesJSON: string;
  azureCapabilitiesJSON: string;
  mapiEndpoint: string;
  athenaEndpoint: string;
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
  info: {
    general: {
      provider: import('shared/types').PropertiesOf<
        typeof import('shared/constants').Providers
      >;
      installationName: string;
      availabilityZones: {
        default: number;
        max: number;
        zones: string[];
      };
      dataCenter: string;
      kubernetesVersions: Record<
        string,
        {
          minorVersion: string;
          eolDate: string;
        }
      >;
    };
    workers: {
      countPerCluster: {
        max: number;
        default: number;
      };
      instanceType: {
        options: string[];
        default: string;
      };
      vmSize: {
        options: string[];
        default: string;
      };
    };
  };
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
