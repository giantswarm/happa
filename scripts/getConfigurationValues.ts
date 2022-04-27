import { Configuration } from './Configuration';

export interface IConfigurationValues {
  apiEndpoint: string;
  mapiEndpoint: string;
  athenaEndpoint: string;
  audience: string;
  mapiAudience: string;
  passageEndpoint: string;
  ingressBaseDomain: string;
  defaultRequestTimeoutSeconds: number;
  environment: string;
  happaVersion: string;
  enableRealUserMonitoring: boolean;

  awsCapabilitiesJSON: string;
  azureCapabilitiesJSON: string;

  mapiAuthRedirectURL: string;
  mapiAuthAdminGroup: string;

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
  config.setDefault('passage-endpoint', 'http://localhost:8000');
  config.setDefault('athena-endpoint', 'http://localhost:8000');
  config.setDefault('enable-rum', true);
  config.setDefault('installation-name', 'development');
  config.setDefault('default-request-timeout-seconds', 10);
  config.setDefault('ingress-base-domain', 'k8s.sample.io');
  config.setDefault('version', 'development');

  config.setDefault(
    'aws-capabilities-json',
    '{"m3.large":{"description":"M3 General Purpose Large","memory_size_gb":7.5,"cpu_cores":2,"storage_size_gb":32},"m3.xlarge":{"description":"M3 General Purpose Extra Large","memory_size_gb":15,"cpu_cores":4,"storage_size_gb":80},"m3.2xlarge":{"description":"M3 General Purpose Double Extra Large","memory_size_gb":30,"cpu_cores":8,"storage_size_gb":160}, "m4.xlarge":{"cpu_cores":4,"description":"M4 General Purpose Extra Large","memory_size_gb":16,"storage_size_gb":0}}'
  );
  config.setDefault(
    'azure-capabilities-json',
    '{"Standard_A2_v2":{"additionalProperties":{},"description":"This is some description","maxDataDiskCount":4,"memoryInMb":4294.967296,"name":"Standard_A2_v2","numberOfCores":2,"osDiskSizeInMb":1047552,"resourceDiskSizeInMb":21474.83648},"Standard_A4_v2":{"additionalProperties":{},"description":"Here is a longer description that might be too long for the field","maxDataDiskCount":8,"memoryInMb":8589.934592,"name":"Standard_A4_v2","numberOfCores":4,"osDiskSizeInMb":1047552,"resourceDiskSizeInMb":42949.67296},"Standard_A8_v2":{"additionalProperties":{},"description":"Another VM size description text","maxDataDiskCount":16,"memoryInMb":17179.869184,"name":"Standard_A8_v2","numberOfCores":8,"osDiskSizeInMb":1047552,"resourceDiskSizeInMb":85899.34592}, "Standard_D2s_v3":{"additionalProperties":{},"description":"Dsv3-series, general purpose, 160-190 ACU, premium storage supported","maxDataDiskCount":4,"memoryInMb":8589.935,"name":"Standard_D2s_v3","numberOfCores":2,"osDiskSizeInMb":1047552,"resourceDiskSizeInMb":17179.87}}'
  );

  config.setDefault(
    'mapi-auth-admin-group',
    'giantswarm:giantswarm:giantswarm-admins'
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
    passageEndpoint: config.getString('passage-endpoint'),
    ingressBaseDomain: config.getString('ingress-base-domain'),
    defaultRequestTimeoutSeconds: config.getNumber(
      'default-request-timeout-seconds'
    ),
    environment: config.getString('installation-name'),
    happaVersion: config.getString('version'),
    enableRealUserMonitoring: config.getBoolean('enable-rum'),

    awsCapabilitiesJSON: config.getString('aws-capabilities-json'),
    azureCapabilitiesJSON: config.getString('azure-capabilities-json'),

    mapiAuthRedirectURL: config.getString('mapi-auth-redirect-url'),
    mapiAuthAdminGroup: config.getString('mapi-auth-admin-group'),

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
