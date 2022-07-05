import { Config } from '@jest/types';
import path from 'path';

process.env.DEBUG_PRINT_LIMIT = '10000';
const esModules = [
  'bail',
  'decode-named-character-reference',
  'hast-util-whitespace',
  'is-plain-obj',
  'markdown-table',
  'mdast-util',
  'micromark',
  'react-markdown',
  'remark',
  'trough',
  'unified',
  'unist-util',
].join('|');

const config: Config.InitialOptions = {
  testEnvironment: 'jest-environment-jsdom', // or jest-environment-node
  testEnvironmentOptions: {
    url: 'http://localhost',
  },
  setupFiles: [
    path.resolve(`${__dirname}/test/browserMocks.ts`),
    path.resolve(`${__dirname}/test/modelMocks.ts`),
  ],
  setupFilesAfterEnv: [path.resolve(`${__dirname}/test/setupTests.ts`)],
  moduleDirectories: [
    'node_modules',
    path.resolve(`${__dirname}/src`),
    path.resolve(`${__dirname}/src/components`),
    path.resolve(`${__dirname}/`),
  ],
  moduleNameMapper: {
    '\\.css$': require.resolve('./test/assetsMock.ts'),
    '\\.(jpg|ico|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      require.resolve('./test/assetsMock.ts'),
  },
  testPathIgnorePatterns: ['/node_modules/', 'node_modules_linux'],
  transformIgnorePatterns: [`<rootDir>/node_modules/(?!(${esModules}))`],
  globals: {
    // window.config object will now be available in all tests
    config: {
      apiEndpoint: 'http://1.2.3.4',
      mapiEndpoint: 'http://2.3.4.5',
      athenaEndpoint: 'http://5.5.5.5',
      audience: 'http://1.2.3.4',
      mapiAudience: 'http://2.3.4.5',
      passageEndpoint: 'http://5.6.7.8',
      environment: 'development',
      ingressBaseDomain: 'k8s.sample.io',
      enableRealUserMonitoring: false,
      defaultRequestTimeoutSeconds: 10,
      awsCapabilitiesJSON:
        '{"m4.xlarge":{"cpu_cores":4,"description":"M4 General Purpose Extra Large","memory_size_gb":16,"storage_size_gb":0},"m3.large":{"description":"M3 General Purpose Large","memory_size_gb":7.5,"cpu_cores":2,"storage_size_gb":32},"m3.xlarge":{"description":"M3 General Purpose Extra Large","memory_size_gb":15,"cpu_cores":4,"storage_size_gb":80},"m3.2xlarge":{"description":"M3 General Purpose Double Extra Large","memory_size_gb":30,"cpu_cores":8,"storage_size_gb":160}}',
      azureCapabilitiesJSON:
        '{"Standard_A2_v2":{"additionalProperties":{},"description":"This is some description","maxDataDiskCount":4,"memoryInMb":4294.967296,"name":"Standard_A2_v2","numberOfCores":2,"osDiskSizeInMb":1047552,"resourceDiskSizeInMb":21474.83648},"Standard_A4_v2":{"additionalProperties":{},"description":"Here is a longer description that might be too long for the field","maxDataDiskCount":8,"memoryInMb":8589.934592,"name":"Standard_A4_v2","numberOfCores":4,"osDiskSizeInMb":1047552,"resourceDiskSizeInMb":42949.67296},"Standard_A8_v2":{"additionalProperties":{},"description":"Another VM size description text","maxDataDiskCount":16,"memoryInMb":17179.869184,"name":"Standard_A8_v2","numberOfCores":8,"osDiskSizeInMb":1047552,"resourceDiskSizeInMb":85899.34592}}',
      gcpCapabilitiesJSON:
        '{"c2-standard-16":{"description":"Compute Optimized: 16 vCPUs, 64 GB RAM","guestCpus":16,"memoryMb":65536},"c2-standard-30":{"description":"Compute Optimized: 30 vCPUs, 120 GB RAM","guestCpus":30,"memoryMb":122880},"c2-standard-4":{"description":"Compute Optimized: 4 vCPUs, 16 GB RAM","guestCpus":4,"memoryMb":16384},"c2-standard-60":{"description":"Compute Optimized: 60 vCPUs, 240 GB RAM","guestCpus":60,"memoryMb":245760},"c2-standard-8":{"description":"Compute Optimized: 8 vCPUs, 32 GB RAM","guestCpus":8,"memoryMb":32768},"e2-highcpu-16":{"description":"Efficient Instance, 16 vCPUs, 16 GB RAM","guestCpus":16,"memoryMb":16384},"e2-highcpu-32":{"description":"Efficient Instance, 32 vCPUs, 32 GB RAM","guestCpus":32,"memoryMb":32768},"e2-highcpu-4":{"description":"Efficient Instance, 4 vCPUs, 4 GB RAM","guestCpus":4,"memoryMb":4096}}',
      info: {
        general: {
          availabilityZones: {
            default: 0,
            max: 0,
            zones: [],
          },
          installationName: 'test',
          provider: 'aws',
          dataCenter: 'test',
          kubernetesVersions: {},
        },
        workers: {
          countPerCluster: {
            default: 3,
            max: 100,
          },
          instanceType: {
            default: '',
            options: [],
          },
          vmSize: {
            default: '',
            options: [],
          },
        },
      },
      permissionsUseCasesJSON:
        '[{"name":"Inspect namespaces","description":"List namespaces and get an individual namespace&apos;s details","category":"access control","scope":{"cluster":true},"permissions":[{"apiGroups":[""],"resources":["namespaces"],"verbs":["get","list"]}]},{"name":"Manage namespaces","description":"Create, modify, delete namespaces","category":"access control","scope":{"cluster":true},"permissions":[{"apiGroups":[""],"resources":["namespaces"],"verbs":["create","delete","get","list","patch","update"]}]},{"name":"Manage organizations","description":"Create, modify, delete organizations","category":"access control","scope":{"cluster":true},"permissions":[{"apiGroups":["security.giantswarm.io"],"resources":["organizations"],"verbs":["create","delete","get","list","patch","update"]}]},{"name":"Inspect permissions","description":"Read ClusterRoles and ClusterRoleBindings","category":"access control","scope":{"cluster":true},"permissions":[{"apiGroups":["rbac.authorization.k8s.io"],"resources":["clusterroles","clusterrolebindings"],"verbs":["get","list"]}]},{"name":"Manage permissions","description":"Create, modify, delete ClusterRoles and ClusterRoleBindings","category":"access control","scope":{"cluster":true},"permissions":[{"apiGroups":["rbac.authorization.k8s.io"],"resources":["clusterroles","clusterrolebindings"],"verbs":["create","delete","get","list","patch","update"]}]},{"name":"Impersonate user or group","description":"Use the Kubernetes API impersonation feature to assume a user&apos;s or a group&apos;s permissions","category":"access control","scope":{"cluster":true},"permissions":[{"apiGroups":[""],"resources":["users","groups"],"verbs":["impersonate"]}]},{"name":"Inspect silences","description":"Read Silence CRs","category":"silences","scope":{"cluster":true},"permissions":[{"apiGroups":["monitoring.giantswarm.io"],"resources":["silences"],"verbs":["get","list"]}]},{"name":"Manage silences","description":"Create, modify, delete Silence CRs","category":"silences","scope":{"cluster":true},"permissions":[{"apiGroups":["monitoring.giantswarm.io"],"resources":["silences"],"verbs":["create","delete","get","list","patch","update"]}]},{"name":"Inspect releases","description":"Read workload cluster releases","category":"releases","scope":{"cluster":true},"permissions":[{"apiGroups":["release.giantswarm.io"],"resources":["releases"],"verbs":["get","list"]}]},{"name":"Inspect shared app catalogs","description":"Read catalogs and their entries in the &quot;default&quot; namespace","category":"app catalogs","scope":{"namespaces":["default"]},"permissions":[{"apiGroups":["application.giantswarm.io"],"resources":["catalogs","appcatalogentries"],"verbs":["get","list"]}]},{"name":"Inspect app catalogs","description":"Read catalogs and their entries in an organization namespace","category":"app catalogs","scope":{"namespaces":["*"]},"permissions":[{"apiGroups":["application.giantswarm.io"],"resources":["catalogs","appcatalogentries"],"verbs":["get","list"]}]},{"name":"Manage app catalogs","description":"Create, modify, delete catalogs and their entries in an organization namespace","category":"app catalogs","scope":{"namespaces":["*"]},"permissions":[{"apiGroups":["application.giantswarm.io"],"resources":["catalogs","appcatalogentries"],"verbs":["create","delete","get","list","patch","update"]}]},{"name":"Inspect apps","description":"Read resources that define installed apps and their configuration","category":"apps","scope":{"namespaces":["*"]},"permissions":[{"apiGroups":["application.giantswarm.io"],"resources":["apps"],"verbs":["get","list"]}]},{"name":"Manage apps","description":"Install and uninstall apps to/from workload clusters and create/modify/delete their configuration","category":"apps","scope":{"namespaces":["*"]},"permissions":[{"apiGroups":["application.giantswarm.io"],"resources":["apps"],"verbs":["create","delete","get","list","patch","update"]},{"apiGroups":[""],"resources":["configmaps","secrets"],"verbs":["create","delete","get","list","patch","update"]}]},{"name":"Inspect provider credentials","description":"Read secrets used to store cloud provider credentials in an organization namespace","category":"provider credentials","scope":{"namespaces":["*"]},"permissions":[{"apiGroups":[""],"resources":["secrets"],"verbs":["get","list"]}]},{"name":"Manage provider credentials","description":"Create, modify, delete secrets used to store cloud provider credentials in an organization namespace","category":"provider credentials","scope":{"namespaces":["*"]},"permissions":[{"apiGroups":[""],"resources":["secrets"],"verbs":["create","delete","get","list","patch","update"]}]},{"name":"Inspect clusters","description":"Read resources that form workload clusters","category":"workload clusters","scope":{"namespaces":["*"]},"permissions":[{"apiGroups":["cluster.x-k8s.io"],"resources":["clusters"],"verbs":["get","list"]},{"apiGroups":["infrastructure.cluster.x-k8s.io"],"resources":["azureclusters","azuremachines"],"verbs":["get","list"]},{"apiGroups":["infrastructure.giantswarm.io"],"resources":["awsclusters","awscontrolplanes","g8scontrolplanes"],"verbs":["get","list"]}]},{"name":"Manage clusters","description":"Create, modify, delete resources that form workload clusters","category":"workload clusters","scope":{"namespaces":["*"]},"permissions":[{"apiGroups":["cluster.x-k8s.io"],"resources":["clusters"],"verbs":["create","delete","get","list","patch","update"]},{"apiGroups":["infrastructure.cluster.x-k8s.io"],"resources":["azureclusters","azuremachines"],"verbs":["create","delete","get","list","patch","update"]},{"apiGroups":["infrastructure.giantswarm.io"],"resources":["awsclusters","awscontrolplanes","g8scontrolplanes"],"verbs":["create","delete","get","list","patch","update"]}]},{"name":"Create client certificates","description":"Create client certificates for workload cluster access","category":"workload clusters","scope":{"namespaces":["*"]},"permissions":[{"apiGroups":[""],"resources":["secrets"],"verbs":["create","delete","get","list","patch","update"]},{"apiGroups":["core.giantswarm.io"],"resources":["certconfigs"],"verbs":["get","list"]}]}]',
    },
    featureFlags: {
      FEATURE_MAPI_AUTH: true,
      FEATURE_MAPI_CLUSTERS: false,
      FEATURE_MONITORING: true,
    },
  },
};

export default config;
