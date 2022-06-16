import {
  IKubectlGSGetAppsCommandConfig,
  IKubectlGSGetClustersCommandConfig,
  IKubectlGSTemplateClusterCommandConfig,
  IKubectlGSTemplateNodePoolCommandConfig,
  IKubectlGSUpdateClusterCommandConfig,
  KubectlGSCommandModifier,
  makeKubectlGSCommand,
  withContext,
  withFormatting,
  withGetApps,
  withGetClusters,
  withTemplateCluster,
  withTemplateNodePool,
  withUpdateCluster,
} from '../utils';

describe('utils', () => {
  describe('makeKubectlGSCommand', () => {
    it('returns an empty command for no arguments', () => {
      const output = makeKubectlGSCommand();
      expect(output).toEqual('kubectl gs');
    });

    it('can be configured with modifiers', () => {
      const modifierA: KubectlGSCommandModifier = (parts) => [
        ...parts,
        'some-arg',
      ];

      let output = makeKubectlGSCommand(modifierA);
      expect(output).toEqual('kubectl gs some-arg');

      const modifierB: KubectlGSCommandModifier = (parts) => [
        ...parts,
        '--some-flag',
        ' ',
        'test',
      ];

      output = makeKubectlGSCommand(modifierA, modifierB);
      expect(output).toEqual('kubectl gs some-arg --some-flag test');

      const modifierC: KubectlGSCommandModifier = (parts) => [
        ...parts,
        '--some-other-flag',
        'value',
      ];

      output = makeKubectlGSCommand(modifierA, modifierB, modifierC);
      expect(output).toEqual(
        'kubectl gs some-arg --some-flag test --some-other-flag value'
      );
    });
  });

  describe('withContext', () => {
    it('does not break if provided an empty value', () => {
      const output = makeKubectlGSCommand(withContext(''));
      expect(output).toEqual('kubectl gs --context');
    });

    it('can be configured with a value', () => {
      const output = makeKubectlGSCommand(withContext('some-value'));
      expect(output).toEqual('kubectl gs --context some-value');
    });

    it('always returns the value at the beginning of the output', () => {
      const modifierA: KubectlGSCommandModifier = (parts) => [
        ...parts,
        'some-arg',
      ];

      const output = makeKubectlGSCommand(modifierA, withContext('some-value'));
      expect(output).toEqual('kubectl gs --context some-value some-arg');
    });
  });

  describe('withTemplateCluster', () => {
    interface ITestCase {
      name: string;
      modifierConfig: IKubectlGSTemplateClusterCommandConfig;
      expectedOutput: string;
    }

    const testCases: ITestCase[] = [
      {
        name: 'returns correct output with only required options',
        modifierConfig: {
          organization: 'some-organization',
          provider: 'some-provider',
        },
        expectedOutput:
          'kubectl gs template cluster --provider some-provider --organization some-organization',
      },
      {
        name: 'returns correct output with name',
        modifierConfig: {
          organization: 'some-organization',
          provider: 'some-provider',
          name: 'some-resource',
        },
        expectedOutput:
          'kubectl gs template cluster --provider some-provider --organization some-organization --name some-resource',
      },
      {
        name: 'returns correct output with description',
        modifierConfig: {
          organization: 'some-organization',
          provider: 'some-provider',
          description: 'User friendliness',
        },
        expectedOutput:
          'kubectl gs template cluster --provider some-provider --organization some-organization --description "User friendliness"',
      },
      {
        name: 'returns correct output with release',
        modifierConfig: {
          organization: 'some-organization',
          provider: 'some-provider',
          release: '14.5.0',
        },
        expectedOutput:
          'kubectl gs template cluster --provider some-provider --organization some-organization --release 14.5.0',
      },
      {
        name: 'returns correct output with label',
        modifierConfig: {
          organization: 'some-organization',
          provider: 'some-provider',
          labels: { label1: 'value1' },
        },
        expectedOutput:
          'kubectl gs template cluster --provider some-provider --organization some-organization --label "label1=value1"',
      },
      {
        name: 'returns correct output with multiple labels',
        modifierConfig: {
          organization: 'some-organization',
          provider: 'some-provider',
          labels: { label1: 'value1', label2: 'value2' },
        },
        expectedOutput:
          'kubectl gs template cluster --provider some-provider --organization some-organization --label "label1=value1" --label "label2=value2"',
      },
      {
        name: 'returns correct output with service priority',
        modifierConfig: {
          organization: 'some-organization',
          provider: 'some-provider',
          servicePriority: 'highest',
        },
        expectedOutput:
          'kubectl gs template cluster --provider some-provider --organization some-organization --service-priority highest',
      },
      {
        name: 'returns correct output with control plane AZ',
        modifierConfig: {
          organization: 'some-organization',
          provider: 'some-provider',
          controlPlaneAZs: ['2'],
        },
        expectedOutput:
          'kubectl gs template cluster --provider some-provider --organization some-organization --control-plane-az 2',
      },
      {
        name: 'returns correct output with multiple control plane AZs',
        modifierConfig: {
          organization: 'some-organization',
          provider: 'some-provider',
          controlPlaneAZs: ['1', '2', '3'],
        },
        expectedOutput:
          'kubectl gs template cluster --provider some-provider --organization some-organization --control-plane-az 1 --control-plane-az 2 --control-plane-az 3',
      },
      {
        name: 'returns correct output with output',
        modifierConfig: {
          organization: 'some-organization',
          provider: 'some-provider',
          output: 'test-file.yaml',
        },
        expectedOutput:
          'kubectl gs template cluster --provider some-provider --organization some-organization --output "test-file.yaml"',
      },
    ];

    for (const tc of testCases) {
      it(tc.name, () => {
        const output = makeKubectlGSCommand(
          withTemplateCluster(tc.modifierConfig)
        );

        expect(output).toEqual(tc.expectedOutput);
      });
    }
  });

  describe('withUpdateCluster', () => {
    interface ITestCase {
      name: string;
      modifierConfig: IKubectlGSUpdateClusterCommandConfig;
      expectedOutput: string;
    }

    const testCases: ITestCase[] = [
      {
        name: 'returns correct output with only required options',
        modifierConfig: {
          provider: 'some-provider',
          namespace: 'the-namespace',
          name: 'some-resource',
          releaseVersion: '16.0.0',
        },
        expectedOutput:
          'kubectl gs update cluster --provider some-provider --namespace the-namespace --name some-resource --release-version 16.0.0',
      },
    ];

    for (const tc of testCases) {
      it(tc.name, () => {
        const output = makeKubectlGSCommand(
          withUpdateCluster(tc.modifierConfig)
        );

        expect(output).toEqual(tc.expectedOutput);
      });
    }
  });

  describe('withGetApps', () => {
    interface ITestCase {
      name: string;
      modifierConfig: IKubectlGSGetAppsCommandConfig;
      expectedOutput: string;
    }

    const testCases: ITestCase[] = [
      {
        name: 'returns correct output without options',
        modifierConfig: {},
        expectedOutput: 'kubectl gs get apps',
      },
      {
        name: 'returns correct output with namespace',
        modifierConfig: {
          namespace: 'the-namespace',
        },
        expectedOutput: 'kubectl gs get apps --namespace the-namespace',
      },
      {
        name: 'returns correct output with all namespaces',
        modifierConfig: {
          allNamespaces: true,
        },
        expectedOutput: 'kubectl gs get apps --all-namespaces',
      },
      {
        name: 'returns correct output with output',
        modifierConfig: {
          output: 'json',
        },
        expectedOutput: 'kubectl gs get apps --output "json"',
      },
    ];

    for (const tc of testCases) {
      it(tc.name, () => {
        const output = makeKubectlGSCommand(withGetApps(tc.modifierConfig));

        expect(output).toEqual(tc.expectedOutput);
      });
    }
  });

  describe('withGetClusters', () => {
    interface ITestCase {
      name: string;
      modifierConfig: IKubectlGSGetClustersCommandConfig;
      expectedOutput: string;
    }

    const testCases: ITestCase[] = [
      {
        name: 'returns correct output without options',
        modifierConfig: {},
        expectedOutput: 'kubectl gs get clusters',
      },
      {
        name: 'returns correct output with namespace',
        modifierConfig: {
          namespace: 'the-namespace',
        },
        expectedOutput: 'kubectl gs get clusters --namespace the-namespace',
      },
      {
        name: 'returns correct output with all namespaces',
        modifierConfig: {
          allNamespaces: true,
        },
        expectedOutput: 'kubectl gs get clusters --all-namespaces',
      },
      {
        name: 'returns correct output with name',
        modifierConfig: {
          name: 'some-cluster',
        },
        expectedOutput: 'kubectl gs get clusters some-cluster',
      },
      {
        name: 'returns correct output with output',
        modifierConfig: {
          output: 'json',
        },
        expectedOutput: 'kubectl gs get clusters --output "json"',
      },
    ];

    for (const tc of testCases) {
      it(tc.name, () => {
        const output = makeKubectlGSCommand(withGetClusters(tc.modifierConfig));

        expect(output).toEqual(tc.expectedOutput);
      });
    }
  });

  describe('withTemplateNodePool', () => {
    interface ITestCase {
      name: string;
      modifierConfig: IKubectlGSTemplateNodePoolCommandConfig;
      expectedOutput: string;
    }

    const testCases: ITestCase[] = [
      {
        name: 'returns correct output with required options',
        modifierConfig: {
          clusterName: 'a1b2c',
          organization: 'some-organization',
          provider: 'some-provider',
          clusterReleaseVersion: '16.0.0',
        },
        expectedOutput:
          'kubectl gs template nodepool --provider some-provider --organization some-organization --cluster-name a1b2c --release 16.0.0',
      },
      {
        name: 'returns correct output with description',
        modifierConfig: {
          clusterName: 'a1b2c',
          organization: 'some-organization',
          provider: 'some-provider',
          clusterReleaseVersion: '16.0.0',
          description: 'Describe me',
        },
        expectedOutput:
          'kubectl gs template nodepool --provider some-provider --organization some-organization --cluster-name a1b2c --release 16.0.0 --description "Describe me"',
      },
      {
        name: 'returns correct output with Azure VM size',
        modifierConfig: {
          clusterName: 'a1b2c',
          organization: 'some-organization',
          provider: 'some-provider',
          clusterReleaseVersion: '16.0.0',
          azureVMSize: 'some_standard_size',
        },
        expectedOutput:
          'kubectl gs template nodepool --provider some-provider --organization some-organization --cluster-name a1b2c --release 16.0.0 --azure-vm-size some_standard_size',
      },
      {
        name: 'returns correct output with one node pool AZ',
        modifierConfig: {
          clusterName: 'a1b2c',
          organization: 'some-organization',
          provider: 'some-provider',
          clusterReleaseVersion: '16.0.0',
          nodePoolAZs: ['1'],
        },
        expectedOutput:
          'kubectl gs template nodepool --provider some-provider --organization some-organization --cluster-name a1b2c --release 16.0.0 --availability-zones 1',
      },
      {
        name: 'returns correct output with multiple node pool AZs',
        modifierConfig: {
          clusterName: 'a1b2c',
          organization: 'some-organization',
          provider: 'some-provider',
          clusterReleaseVersion: '16.0.0',
          nodePoolAZs: ['1', '2'],
        },
        expectedOutput:
          'kubectl gs template nodepool --provider some-provider --organization some-organization --cluster-name a1b2c --release 16.0.0 --availability-zones 1,2',
      },
      {
        name: 'returns correct output with use Azure spot VMs',
        modifierConfig: {
          clusterName: 'a1b2c',
          organization: 'some-organization',
          provider: 'some-provider',
          clusterReleaseVersion: '16.0.0',
          azureUseSpotVMs: true,
        },
        expectedOutput:
          'kubectl gs template nodepool --provider some-provider --organization some-organization --cluster-name a1b2c --release 16.0.0 --azure-spot-vms',
      },
      {
        name: 'returns correct output with Azure spot VMs max price',
        modifierConfig: {
          clusterName: 'a1b2c',
          organization: 'some-organization',
          provider: 'some-provider',
          clusterReleaseVersion: '16.0.0',
          azureUseSpotVMs: true,
          azureSpotVMsMaxPrice: 0.00001,
        },
        expectedOutput:
          'kubectl gs template nodepool --provider some-provider --organization some-organization --cluster-name a1b2c --release 16.0.0 --azure-spot-vms --azure-spot-vms-max-price 0.00001',
      },
      {
        name: 'returns correct output with AWS spot instances on demand base capacity',
        modifierConfig: {
          clusterName: 'a1b2c',
          organization: 'some-organization',
          provider: 'some-provider',
          clusterReleaseVersion: '16.0.0',
          awsOnDemandBaseCapacity: 20,
        },
        expectedOutput:
          'kubectl gs template nodepool --provider some-provider --organization some-organization --cluster-name a1b2c --release 16.0.0 --on-demand-base-capacity 20',
      },
      {
        name: 'returns correct output with AWS spot instances on demand percentage above base capacity',
        modifierConfig: {
          clusterName: 'a1b2c',
          organization: 'some-organization',
          provider: 'some-provider',
          clusterReleaseVersion: '16.0.0',
          awsOnDemandPercentageAboveBaseCapacity: 100,
        },
        expectedOutput:
          'kubectl gs template nodepool --provider some-provider --organization some-organization --cluster-name a1b2c --release 16.0.0 --on-demand-percentage-above-base-capacity 100',
      },
      {
        name: 'returns correct output with minimum number of nodes',
        modifierConfig: {
          clusterName: 'a1b2c',
          organization: 'some-organization',
          provider: 'some-provider',
          clusterReleaseVersion: '16.0.0',
          nodesMin: 0,
        },
        expectedOutput:
          'kubectl gs template nodepool --provider some-provider --organization some-organization --cluster-name a1b2c --release 16.0.0 --nodes-min 0',
      },
      {
        name: 'returns correct output if the minimum number of nodes equals the recommended default',
        modifierConfig: {
          clusterName: 'a1b2c',
          organization: 'some-organization',
          provider: 'some-provider',
          clusterReleaseVersion: '16.0.0',
          nodesMin: 3,
        },
        expectedOutput:
          'kubectl gs template nodepool --provider some-provider --organization some-organization --cluster-name a1b2c --release 16.0.0',
      },
      {
        name: 'returns correct output with maximum number of nodes',
        modifierConfig: {
          clusterName: 'a1b2c',
          organization: 'some-organization',
          provider: 'some-provider',
          clusterReleaseVersion: '16.0.0',
          nodesMax: 8,
        },
        expectedOutput:
          'kubectl gs template nodepool --provider some-provider --organization some-organization --cluster-name a1b2c --release 16.0.0 --nodes-max 8',
      },
      {
        name: 'returns correct output if the maximum number of nodes equals the recommended default',
        modifierConfig: {
          clusterName: 'a1b2c',
          organization: 'some-organization',
          provider: 'some-provider',
          clusterReleaseVersion: '16.0.0',
          nodesMax: 10,
        },
        expectedOutput:
          'kubectl gs template nodepool --provider some-provider --organization some-organization --cluster-name a1b2c --release 16.0.0',
      },
    ];

    for (const tc of testCases) {
      it(tc.name, () => {
        const output = makeKubectlGSCommand(
          withTemplateNodePool(tc.modifierConfig)
        );

        expect(output).toEqual(tc.expectedOutput);
      });
    }
  });

  describe('withFormatting', () => {
    interface ITestCase {
      name: string;
      args: string[];
      expectedOutput: string;
    }

    const testCases: ITestCase[] = [
      {
        name: 'returns correct output for no input',
        args: [],
        expectedOutput: 'kubectl gs',
      },
      {
        name: 'returns correct output for a short command',
        args: ['some-arg', 'some-other-arg'],
        expectedOutput: 'kubectl gs some-arg some-other-arg',
      },
      {
        name: 'returns correct output for a long command',
        args: ['get', 'some', 'resources', 'from', 'somewhere'],
        expectedOutput: `kubectl gs get some resources from somewhere`,
      },
      {
        name: 'returns correct output for a long command and no arguments',
        args: [
          '--some-flag',
          'super-value',
          '--some-other-flag',
          'other-value',
          '--some-random-flag',
          'the-value',
        ],
        expectedOutput: `kubectl gs \\
  --some-flag super-value \\
  --some-other-flag other-value \\
  --some-random-flag the-value`,
      },
      {
        name: 'returns correct output for a long command and some arguments',
        args: [
          'get',
          'some',
          'resources',
          '--some-flag',
          'super-value',
          '--some-other-flag',
          'other-value',
          '--some-random-flag',
          'the-value',
        ],
        expectedOutput: `kubectl gs get some resources \\
  --some-flag super-value \\
  --some-other-flag other-value \\
  --some-random-flag the-value`,
      },
      {
        name: 'returns correct output for a long command and a flag before it',
        args: ['--some-flag', 'super-value', 'get', 'some', 'resources'],
        expectedOutput: `kubectl gs --some-flag super-value \\
  get some resources`,
      },
      {
        name: 'returns correct output for a long command, a flag before it, and some more flags after it',
        args: [
          '--some-flag',
          'super-value',
          'get',
          'some',
          'resources',
          '--some-other-flag',
          'other-value',
        ],
        expectedOutput: `kubectl gs --some-flag super-value \\
  get some resources \\
  --some-other-flag other-value`,
      },
    ];

    for (const tc of testCases) {
      it(tc.name, () => {
        const output = makeKubectlGSCommand(() => tc.args, withFormatting());

        expect(output).toEqual(tc.expectedOutput);
      });
    }
  });
});
