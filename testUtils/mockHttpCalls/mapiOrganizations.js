export const singleMAPIOrgResponse = {
  apiVersion: 'security.giantswarm.io/v1alpha1',
  kind: 'Organization',
  metadata: {
    name: 'org1',
  },
  spec: {},
};

export const emptyMAPIOrgsResponse = {
  apiVersion: 'security.giantswarm.io/v1alpha1',
  items: [],
  kind: 'OrganizationList',
  metadata: {
    continue: '',
    resourceVersion: '282193745',
    selfLink: '/apis/security.giantswarm.io/v1alpha1/organizations/',
  },
};

export const mapiOrgsResponse = {
  apiVersion: 'security.giantswarm.io/v1alpha1',
  items: [
    {
      apiVersion: 'security.giantswarm.io/v1alpha1',
      kind: 'Organization',
      metadata: {
        creationTimestamp: '2021-03-26T10:11:27Z',
        finalizers: [
          'operatorkit.giantswarm.io/organization-operator-organization-controller',
        ],
        generation: 1,
        managedFields: [
          {
            apiVersion: 'security.giantswarm.io/v1alpha1',
            fieldsType: 'FieldsV1',
            fieldsV1: { 'f:spec': {} },
            manager: 'Mozilla',
            operation: 'Update',
            time: '2021-03-26T10:11:27Z',
          },
          {
            apiVersion: 'security.giantswarm.io/v1alpha1',
            fieldsType: 'FieldsV1',
            fieldsV1: {
              'f:metadata': {
                'f:finalizers': {
                  '.': {},
                  'v:"operatorkit.giantswarm.io/organization-operator-organization-controller"': {},
                },
              },
            },
            manager: 'organization-operator',
            operation: 'Update',
            time: '2021-03-26T10:11:27Z',
          },
        ],
        name: 'adrian',
        resourceVersion: '282162502',
        selfLink: '/apis/security.giantswarm.io/v1alpha1/organizations/adrian',
        uid: 'fa7b060d-a123-4bad-a92b-2f8f2f04b62c',
      },
      spec: {},
    },
    {
      apiVersion: 'security.giantswarm.io/v1alpha1',
      kind: 'Organization',
      metadata: {
        annotations: {
          'kubectl.kubernetes.io/last-applied-configuration':
            '{"apiVersion":"security.giantswarm.io/v1alpha1","kind":"Organization","metadata":{"annotations":{},"name":"conformance-testing"},"spec":{}}\n',
        },
        creationTimestamp: '2020-10-15T14:13:36Z',
        finalizers: [
          'operatorkit.giantswarm.io/organization-operator-organization-controller',
        ],
        generation: 1,
        labels: { 'giantswarm.io/conformance-testing': 'true' },
        name: 'conformance-testing',
        resourceVersion: '256170303',
        selfLink:
          '/apis/security.giantswarm.io/v1alpha1/organizations/conformance-testing',
        uid: '43086490-d5f7-4b4a-8b1d-3a71833b03ea',
      },
      spec: {},
    },
    {
      apiVersion: 'security.giantswarm.io/v1alpha1',
      kind: 'Organization',
      metadata: {
        creationTimestamp: '2021-01-26T12:31:03Z',
        finalizers: [
          'operatorkit.giantswarm.io/organization-operator-organization-controller',
        ],
        generation: 1,
        labels: { 'giantswarm.io/conformance-testing': 'true' },
        managedFields: [
          {
            apiVersion: 'security.giantswarm.io/v1alpha1',
            fieldsType: 'FieldsV1',
            fieldsV1: { 'f:spec': {} },
            manager: 'api',
            operation: 'Update',
            time: '2021-01-26T12:31:03Z',
          },
          {
            apiVersion: 'security.giantswarm.io/v1alpha1',
            fieldsType: 'FieldsV1',
            fieldsV1: {
              'f:metadata': {
                'f:finalizers': {
                  '.': {},
                  'v:"operatorkit.giantswarm.io/organization-operator-organization-controller"': {},
                },
              },
            },
            manager: 'organization-operator',
            operation: 'Update',
            time: '2021-01-26T12:31:03Z',
          },
          {
            apiVersion: 'security.giantswarm.io/v1alpha1',
            fieldsType: 'FieldsV1',
            fieldsV1: {
              'f:metadata': {
                'f:labels': {
                  '.': {},
                  'f:giantswarm.io/conformance-testing': {},
                },
              },
            },
            manager: 'kubectl',
            operation: 'Update',
            time: '2021-01-26T12:32:24Z',
          },
        ],
        name: 'ghost',
        resourceVersion: '256595543',
        selfLink: '/apis/security.giantswarm.io/v1alpha1/organizations/ghost',
        uid: '930359e6-4571-4e8a-a7ec-198f03db2d0f',
      },
      spec: {},
    },
    {
      apiVersion: 'security.giantswarm.io/v1alpha1',
      kind: 'Organization',
      metadata: {
        annotations: {
          'kubectl.kubernetes.io/last-applied-configuration':
            '{"apiVersion":"security.giantswarm.io/v1alpha1","kind":"Organization","metadata":{"annotations":{},"name":"giantswarm"},"spec":{}}\n',
        },
        creationTimestamp: '2020-09-29T10:42:53Z',
        finalizers: [
          'operatorkit.giantswarm.io/organization-operator-organization-controller',
        ],
        generation: 1,
        name: 'giantswarm',
        resourceVersion: '207361051',
        selfLink:
          '/apis/security.giantswarm.io/v1alpha1/organizations/giantswarm',
        uid: '5fc67165-38d0-4681-9727-0ed78f04c7f3',
      },
      spec: {},
    },
    {
      apiVersion: 'security.giantswarm.io/v1alpha1',
      kind: 'Organization',
      metadata: {
        creationTimestamp: '2021-02-08T09:53:37Z',
        finalizers: [
          'operatorkit.giantswarm.io/organization-operator-organization-controller',
        ],
        generation: 1,
        managedFields: [
          {
            apiVersion: 'security.giantswarm.io/v1alpha1',
            fieldsType: 'FieldsV1',
            fieldsV1: { 'f:spec': {} },
            manager: 'api',
            operation: 'Update',
            time: '2021-02-08T09:53:37Z',
          },
          {
            apiVersion: 'security.giantswarm.io/v1alpha1',
            fieldsType: 'FieldsV1',
            fieldsV1: {
              'f:metadata': {
                'f:finalizers': {
                  '.': {},
                  'v:"operatorkit.giantswarm.io/organization-operator-organization-controller"': {},
                },
              },
            },
            manager: 'organization-operator',
            operation: 'Update',
            time: '2021-02-08T09:53:37Z',
          },
        ],
        name: 'org1',
        resourceVersion: '262065045',
        selfLink: '/apis/security.giantswarm.io/v1alpha1/organizations/org1',
        uid: 'db806f25-2a1f-47ca-926d-22745237e86f',
      },
      spec: {},
    },
    {
      apiVersion: 'security.giantswarm.io/v1alpha1',
      kind: 'Organization',
      metadata: {
        creationTimestamp: '2021-03-25T14:18:08Z',
        finalizers: [
          'operatorkit.giantswarm.io/organization-operator-organization-controller',
        ],
        generation: 1,
        managedFields: [
          {
            apiVersion: 'security.giantswarm.io/v1alpha1',
            fieldsType: 'FieldsV1',
            fieldsV1: { 'f:spec': {} },
            manager: 'Mozilla',
            operation: 'Update',
            time: '2021-03-25T14:18:08Z',
          },
          {
            apiVersion: 'security.giantswarm.io/v1alpha1',
            fieldsType: 'FieldsV1',
            fieldsV1: {
              'f:metadata': {
                'f:finalizers': {
                  '.': {},
                  'v:"operatorkit.giantswarm.io/organization-operator-organization-controller"': {},
                },
              },
            },
            manager: 'organization-operator',
            operation: 'Update',
            time: '2021-03-25T14:18:08Z',
          },
        ],
        name: 'org2',
        resourceVersion: '281767806',
        selfLink: '/apis/security.giantswarm.io/v1alpha1/organizations/org2',
        uid: 'd2381cd3-f8f9-46b2-b32a-d71a2105a0d6',
      },
      spec: {},
    },
    {
      apiVersion: 'security.giantswarm.io/v1alpha1',
      kind: 'Organization',
      metadata: {
        creationTimestamp: '2021-03-25T14:18:19Z',
        finalizers: [
          'operatorkit.giantswarm.io/organization-operator-organization-controller',
        ],
        generation: 1,
        managedFields: [
          {
            apiVersion: 'security.giantswarm.io/v1alpha1',
            fieldsType: 'FieldsV1',
            fieldsV1: { 'f:spec': {} },
            manager: 'Mozilla',
            operation: 'Update',
            time: '2021-03-25T14:18:19Z',
          },
          {
            apiVersion: 'security.giantswarm.io/v1alpha1',
            fieldsType: 'FieldsV1',
            fieldsV1: {
              'f:metadata': {
                'f:finalizers': {
                  '.': {},
                  'v:"operatorkit.giantswarm.io/organization-operator-organization-controller"': {},
                },
              },
            },
            manager: 'organization-operator',
            operation: 'Update',
            time: '2021-03-25T14:18:19Z',
          },
        ],
        name: 'org3',
        resourceVersion: '281767873',
        selfLink: '/apis/security.giantswarm.io/v1alpha1/organizations/org3',
        uid: '172516f5-d1ca-48b5-b818-daa3e307c839',
      },
      spec: {},
    },
  ],
  kind: 'OrganizationList',
  metadata: {
    continue: '',
    resourceVersion: '282193745',
    selfLink: '/apis/security.giantswarm.io/v1alpha1/organizations/',
  },
};
