import * as k8sUrl from '../k8sUrl';

describe('k8sUrl', () => {
  describe('create', () => {
    interface ITestCase {
      options:
        | k8sUrl.IK8sGetOptions
        | k8sUrl.IK8sListOptions
        | k8sUrl.IK8sWatchOptions
        | k8sUrl.IK8sCreateOptions
        | k8sUrl.IK8sUpdateOptions
        | k8sUrl.IK8sPatchOptions
        | k8sUrl.IK8sDeleteOptions;
      expected: string | Error;
    }

    const testCases: ITestCase[] = [
      {
        options: {
          baseUrl: 'https://some-url.com',
          apiVersion: 'some-resource.k8s.io/v1alpha1',
          kind: 'resources',
        },
        expected:
          'https://some-url.com/apis/some-resource.k8s.io/v1alpha1/resources/',
      },
      {
        options: {
          baseUrl: 'https://some-url.com',
          apiVersion: 'some-resource.k8s.io/v1alpha1',
          kind: 'resources',
          name: 'bf23a',
        },
        expected:
          'https://some-url.com/apis/some-resource.k8s.io/v1alpha1/resources/bf23a/',
      },
      {
        options: {
          baseUrl: 'https://some-url.com',
          apiVersion: 'some-resource.k8s.io/v1alpha1',
          kind: 'resources',
          name: 'bf23a',
          namespace: 'some-namespace',
        },
        expected:
          'https://some-url.com/apis/some-resource.k8s.io/v1alpha1/namespaces/some-namespace/resources/bf23a/',
      },
      {
        options: {
          baseUrl: 'https://some-url.com',
          apiVersion: 'some-resource.k8s.io/v1alpha1',
          kind: 'resources',
          namespace: 'some-namespace',
        },
        expected:
          'https://some-url.com/apis/some-resource.k8s.io/v1alpha1/namespaces/some-namespace/resources/',
      },
      {
        options: {
          baseUrl: 'https://some-url.com',
          apiVersion: 'some-resource.k8s.io/v1alpha1',
          kind: 'resources',
          namespace: 'some-namespace',
          dryRun: true,
        },
        expected:
          'https://some-url.com/apis/some-resource.k8s.io/v1alpha1/namespaces/some-namespace/resources/?dryRun=true',
      },
      {
        options: {
          baseUrl: 'https://some-url.com',
          apiVersion: 'some-resource.k8s.io/v1alpha1',
          kind: 'resources',
          namespace: 'some-namespace',
          labelSelector: {
            matchingLabels: {},
          },
        },
        expected:
          'https://some-url.com/apis/some-resource.k8s.io/v1alpha1/namespaces/some-namespace/resources/',
      },
      {
        options: {
          baseUrl: 'https://some-url.com',
          apiVersion: 'some-resource.k8s.io/v1alpha1',
          kind: 'resources',
          namespace: 'some-namespace',
          labelSelector: {
            matchingLabels: {
              'some-label.some-url.com/something': 'test',
            },
          },
        },
        expected:
          'https://some-url.com/apis/some-resource.k8s.io/v1alpha1/namespaces/some-namespace/resources/?labelSelector=some-label.some-url.com%2Fsomething%3Dtest',
      },
      {
        options: {
          baseUrl: 'https://some-url.com',
          apiVersion: 'some-resource.k8s.io/v1alpha1',
          kind: 'resources',
          namespace: 'some-namespace',
          labelSelector: {
            matchingLabels: {
              'some-label.some-url.com/something': 'test',
              'some-other-label.some-url.com/something': 'test2',
            },
          },
        },
        expected:
          'https://some-url.com/apis/some-resource.k8s.io/v1alpha1/namespaces/some-namespace/resources/?labelSelector=some-label.some-url.com%2Fsomething%3Dtest%2Csome-other-label.some-url.com%2Fsomething%3Dtest2',
      },
      {
        options: {
          baseUrl: 'https://some-url.com',
          apiVersion: 'some-resource.k8s.io/v1alpha1',
          kind: 'resources',
          namespace: 'some-namespace',
          name: 'bf23a',
          labelSelector: {
            matchingLabels: {
              'some-label.some-url.com/something': 'test',
              'some-other-label.some-url.com/something': 'test2',
            },
          },
        },
        expected: new Error(
          `The option 'labelSelector' cannot be set when 'name' is present.`
        ),
      },
      {
        options: {
          baseUrl: 'https://some-url.com',
          apiVersion: 'some-resource.k8s.io/v1alpha1',
          kind: 'resources',
          namespace: 'some-namespace',
          fieldSelector: {
            matchingFields: {},
          },
        },
        expected:
          'https://some-url.com/apis/some-resource.k8s.io/v1alpha1/namespaces/some-namespace/resources/',
      },
      {
        options: {
          baseUrl: 'https://some-url.com',
          apiVersion: 'some-resource.k8s.io/v1alpha1',
          kind: 'resources',
          namespace: 'some-namespace',
          fieldSelector: {
            matchingFields: {
              'metadata.name': 'test',
            },
          },
        },
        expected:
          'https://some-url.com/apis/some-resource.k8s.io/v1alpha1/namespaces/some-namespace/resources/?fieldSelector=metadata.name%3Dtest',
      },
      {
        options: {
          baseUrl: 'https://some-url.com',
          apiVersion: 'some-resource.k8s.io/v1alpha1',
          kind: 'resources',
          namespace: 'some-namespace',
          fieldSelector: {
            matchingFields: {
              'metadata.name': 'test',
              'status.ready': 'true',
            },
          },
        },
        expected:
          'https://some-url.com/apis/some-resource.k8s.io/v1alpha1/namespaces/some-namespace/resources/?fieldSelector=metadata.name%3Dtest%2Cstatus.ready%3Dtrue',
      },
      {
        options: {
          baseUrl: 'https://some-url.com',
          apiVersion: 'some-resource.k8s.io/v1alpha1',
          kind: 'resources',
          namespace: 'some-namespace',
          name: 'bf23a',
          fieldSelector: {
            matchingFields: {
              'metadata.name': 'test',
              'status.ready': 'true',
            },
          },
        },
        expected: new Error(
          `The option 'fieldSelector' cannot be set when 'name' is present.`
        ),
      },
      {
        options: {
          baseUrl: 'https://some-url.com',
          apiVersion: 'some-resource.k8s.io/v1alpha1',
          kind: 'resources',
          name: 'bf23a',
          namespace: 'some-namespace',
          watch: true,
        },
        expected:
          'https://some-url.com/apis/some-resource.k8s.io/v1alpha1/namespaces/some-namespace/resources/bf23a/?watch=true',
      },
      {
        options: {
          baseUrl: 'https://some-url.com',
          apiVersion: 'some-resource.k8s.io/v1alpha1',
          kind: 'resources',
          namespace: 'some-namespace',
          watch: true,
        },
        expected: new Error(
          `The option 'watch' can only be set when 'name' is present.`
        ),
      },
    ];

    for (const { options, expected } of testCases) {
      const optionKeys = Object.keys(options).join(', ');

      it(`with options [${optionKeys}]`, () => {
        if (expected instanceof Error) {
          expect(() => {
            k8sUrl.create(options);
          }).toThrowError(expected);

          return;
        }

        const url = k8sUrl.create(options);

        expect(url.toString()).toEqual(expected);
      });
    }
  });
});
