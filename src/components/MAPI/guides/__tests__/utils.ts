import {
  IKubectlGSGetClustersCommandConfig,
  IKubectlGSTemplateClusterCommandConfig,
  KubectlGSCommandModifier,
  makeKubectlGSCommand,
  withContext,
  withFormatting,
  withGetClusters,
  withTemplateCluster,
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
          owner: 'some-owner',
          provider: 'some-provider',
        },
        expectedOutput:
          'kubectl gs template cluster --provider some-provider --owner some-owner',
      },
      {
        name: 'returns correct output with name',
        modifierConfig: {
          owner: 'some-owner',
          provider: 'some-provider',
          name: 'some-resource',
        },
        expectedOutput:
          'kubectl gs template cluster --provider some-provider --owner some-owner --name some-resource',
      },
      {
        name: 'returns correct output with description',
        modifierConfig: {
          owner: 'some-owner',
          provider: 'some-provider',
          description: 'User friendliness',
        },
        expectedOutput:
          'kubectl gs template cluster --provider some-provider --owner some-owner --description "User friendliness"',
      },
      {
        name: 'returns correct output with release',
        modifierConfig: {
          owner: 'some-owner',
          provider: 'some-provider',
          release: '14.5.0',
        },
        expectedOutput:
          'kubectl gs template cluster --provider some-provider --owner some-owner --release 14.5.0',
      },
      {
        name: 'returns correct output with label',
        modifierConfig: {
          owner: 'some-owner',
          provider: 'some-provider',
          labels: { label1: 'value1' },
        },
        expectedOutput:
          'kubectl gs template cluster --provider some-provider --owner some-owner --label "label1=value1"',
      },
      {
        name: 'returns correct output with multiple labels',
        modifierConfig: {
          owner: 'some-owner',
          provider: 'some-provider',
          labels: { label1: 'value1', label2: 'value2' },
        },
        expectedOutput:
          'kubectl gs template cluster --provider some-provider --owner some-owner --label "label1=value1" --label "label2=value2"',
      },
      {
        name: 'returns correct output with control plane AZ',
        modifierConfig: {
          owner: 'some-owner',
          provider: 'some-provider',
          controlPlaneAZs: ['2'],
        },
        expectedOutput:
          'kubectl gs template cluster --provider some-provider --owner some-owner --control-plane-az 2',
      },
      {
        name: 'returns correct output with multiple control plane AZs',
        modifierConfig: {
          owner: 'some-owner',
          provider: 'some-provider',
          controlPlaneAZs: ['1', '2', '3'],
        },
        expectedOutput:
          'kubectl gs template cluster --provider some-provider --owner some-owner --control-plane-az 1 --control-plane-az 2 --control-plane-az 3',
      },
      {
        name: 'returns correct output with output',
        modifierConfig: {
          owner: 'some-owner',
          provider: 'some-provider',
          output: 'test-file.yaml',
        },
        expectedOutput:
          'kubectl gs template cluster --provider some-provider --owner some-owner --output "test-file.yaml"',
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
        expectedOutput: 'kubectl gs get clusters -o "json"',
      },
    ];

    for (const tc of testCases) {
      it(tc.name, () => {
        const output = makeKubectlGSCommand(withGetClusters(tc.modifierConfig));

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
        name:
          'returns correct output for a long command, a flag before it, and some more flags after it',
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
