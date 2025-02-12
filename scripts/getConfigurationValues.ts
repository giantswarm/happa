import { Configuration } from './Configuration';

export interface IConfigurationValues {
  apiEndpoint: string;
  mapiEndpoint: string;
  athenaEndpoint: string;
  audience: string;
  mapiAudience: string;
  ingressBaseDomain: string;
  defaultRequestTimeoutSeconds: number;
  environment: string;
  happaVersion: string;

  awsCapabilitiesJSON: string;
  azureCapabilitiesJSON: string;
  gcpCapabilitiesJSON: string;

  mapiAuthRedirectURL: string;
  mapiAuthAdminGroups: string;

  sentryDsn: string;
  sentryEnvironment: string;
  sentryReleaseVersion: string;
  sentryDebug: boolean;
  sentryPipeline: string;
  sentrySampleRate: number;

  FEATURE_MAPI_AUTH: boolean;
  FEATURE_MAPI_CLUSTERS: boolean;
  FEATURE_MONITORING: boolean;

  info: {
    general: {
      provider: string;
      providerFlavor: string;
      installationName: string;
      availabilityZones: {
        default: number;
        zones: string;
      };
      dataCenter: string;
      kubernetesVersions: string;
    };
    workers: {
      countPerCluster: {
        max: number;
        default: number;
      };
      instanceType: {
        options: string;
        default: string;
      };
      vmSize: {
        options: string;
        default: string;
      };
    };
  };

  permissionsUseCasesJSON: string;
}

/**
 * This function maps the configuration file values
 * to the values used for templating.
 * @param getConfigurationValues
 * */
export async function getConfigurationValues(
  fromConfig: string = ''
): Promise<IConfigurationValues> {
  const config = new Configuration();

  config.parse(fromConfig);

  config.setDefault('api-endpoint', 'http://localhost:8000');
  config.setDefault('mapi-endpoint', 'http://localhost:8000');
  config.setDefault('audience', 'http://localhost:8000');
  config.setDefault('mapi-audience', 'http://localhost:8000');
  config.setDefault('athena-endpoint', 'http://localhost:8000');
  config.setDefault('installation-name', 'development');
  config.setDefault('default-request-timeout-seconds', 10);
  config.setDefault('ingress-base-domain', 'k8s.sample.io');
  config.setDefault('version', 'development');

  config.setDefault(
    'mapi-auth-admin-groups',
    'giantswarm:giantswarm:giantswarm-admins giantswarm-ad:giantswarm-admins'
  );
  config.setDefault('mapi-auth-redirect-url', 'http://localhost:7000');

  config.setDefault('sentry-environment', 'development');
  config.setDefault('sentry-release-version', 'development');
  config.setDefault('sentry-sample-rate', 0.5);
  config.setDefault('sentry-pipeline', 'testing');

  config.setDefault('feature-monitoring', true);

  config.setDefault('info.general.installationName', 'development');
  config.setDefault('info.general.dataCenter', 'development');
  config.setDefault('info.general.kubernetesVersions', '""');

  config.useEnvVariables();
  config.setEnvVariablePrefix('HAPPA');

  return {
    apiEndpoint: config.getString('api-endpoint'),
    mapiEndpoint: config.getString('mapi-endpoint'),
    athenaEndpoint: config.getString('athena-endpoint'),
    audience: config.getString('audience'),
    mapiAudience: config.getString('mapi-audience'),
    ingressBaseDomain: config.getString('ingress-base-domain'),
    defaultRequestTimeoutSeconds: config.getNumber(
      'default-request-timeout-seconds'
    ),
    environment: config.getString('installation-name'),
    happaVersion: config.getString('version'),

    awsCapabilitiesJSON: config.getString('aws-capabilities-json'),
    azureCapabilitiesJSON: config.getString('azure-capabilities-json'),
    gcpCapabilitiesJSON: config.getString('gcp-capabilities-json'),

    mapiAuthRedirectURL: config.getString('mapi-auth-redirect-url'),
    mapiAuthAdminGroups: config.getString('mapi-auth-admin-groups'),

    sentryDsn: config.getString('sentry-dsn'),
    sentryEnvironment: config.getString('sentry-environment'),
    sentryReleaseVersion: config.getString('sentry-release-version'),
    sentryPipeline: config.getString('sentry-pipeline'),
    sentryDebug: config.getBoolean('sentry-debug'),
    sentrySampleRate: config.getNumber('sentry-sample-rate'),

    FEATURE_MAPI_AUTH: config.getBoolean('feature-mapi-auth'),
    FEATURE_MAPI_CLUSTERS: config.getBoolean('feature-mapi-clusters'),
    FEATURE_MONITORING: config.getBoolean('feature-monitoring'),

    info: {
      general: {
        provider: config.getString('info.general.provider'),
        providerFlavor: config.getString('info.general.providerFlavor'),
        installationName: config.getString('info.general.installationName'),
        availabilityZones: {
          default: config.getNumber('info.general.availabilityZones.default'),
          zones: config.getString('info.general.availabilityZones.zones'),
        },
        dataCenter: config.getString('info.general.dataCenter'),
        kubernetesVersions: config.getString('info.general.kubernetesVersions'),
      },
      workers: {
        countPerCluster: {
          default: config.getNumber('info.workers.countPerCluster.default'),
          max: config.getNumber('info.workers.countPerCluster.max'),
        },
        instanceType: {
          options: config.getString('info.workers.instanceType.options'),
          default: config.getString('info.workers.instanceType.default'),
        },
        vmSize: {
          options: config.getString('info.workers.vmSize.options'),
          default: config.getString('info.workers.vmSize.default'),
        },
      },
    },

    permissionsUseCasesJSON: config.getString('permissions-use-cases-json'),
  };
}
