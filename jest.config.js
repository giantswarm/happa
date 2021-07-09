// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

process.env.DEBUG_PRINT_LIMIT = 10000;

module.exports = {
  transform: {
    '^.+\\.(js|ts)(x?)$': [
      '@swc-node/jest',
      {
        dynamicImport: true,
        target: 'es2015',
        sourcemap: true,
        jsx: true,
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
        esModuleInterop: true,
        react: {
          runtime: 'automatic',
          development: true,
        },
      },
    ],
  },
  testEnvironment: 'jest-environment-jsdom', // or jest-environment-node
  testURL: 'http://localhost',
  setupFiles: [
    path.resolve(`${__dirname}/testUtils/browserMocks.js`),
    path.resolve(`${__dirname}/testUtils/modelMocks.js`),
  ],
  setupFilesAfterEnv: [path.resolve(`${__dirname}/testUtils/setupTests.js`)],
  moduleDirectories: [
    'node_modules',
    path.resolve(`${__dirname}/src`),
    path.resolve(`${__dirname}/src/components`),
    path.resolve(`${__dirname}/`),
  ],
  moduleNameMapper: {
    '\\.css$': require.resolve('./testUtils/assetsMock.js'),
    '\\.(jpg|ico|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': require.resolve(
      './testUtils/assetsMock.js'
    ),
  },
  testPathIgnorePatterns: ['/node_modules/', 'node_modules_linux'],
  globals: {
    // window.config object will now be available in all tests
    config: {
      apiEndpoint: 'http://1.2.3.4',
      mapiEndpoint: 'http://2.3.4.5',
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
    },
    featureFlags: {
      FEATURE_MAPI_AUTH: true,
      FEATURE_MAPI_CLUSTERS: false,
      FEATURE_MONITORING: true,
    },
  },
};
