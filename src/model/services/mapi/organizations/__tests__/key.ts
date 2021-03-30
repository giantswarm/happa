import { getOrganizationUIName } from '../key';
import { IOrganization } from '../types';

describe('getOrganizationUIName', () => {
  describe('create', () => {
    interface ITestCase {
      description: string;
      organization: IOrganization;
      expected: string;
    }

    const testCases: ITestCase[] = [
      {
        description: 'a CR without any annotation',
        organization: {
          apiVersion: 'security.giantswarm.io/v1alpha1',
          kind: 'Organization',
          metadata: {
            name: 'yolo',
          },
          spec: {},
        },
        expected: 'yolo',
      },
      {
        description: 'a CR with an annotation',
        organization: {
          apiVersion: 'security.giantswarm.io/v1alpha1',
          kind: 'Organization',
          metadata: {
            name: 'yolo',
            annotations: {
              'ui.giantswarm.io/original-organization-name': 'YOLO',
            },
          },
          spec: {},
        },
        expected: 'YOLO',
      },
      {
        description: 'a CR with an empty annotation',
        organization: {
          apiVersion: 'security.giantswarm.io/v1alpha1',
          kind: 'Organization',
          metadata: {
            name: 'yolo',
            annotations: {
              'ui.giantswarm.io/original-organization-name': '',
            },
          },
          spec: {},
        },
        expected: 'yolo',
      },
    ];

    for (const { organization, description, expected } of testCases) {
      it(`figures out the right UI name for ${description}`, () => {
        const result = getOrganizationUIName(organization);

        expect(result).toEqual(expected);
      });
    }
  });
});
