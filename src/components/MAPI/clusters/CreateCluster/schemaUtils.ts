import { GenericObjectType, UiSchema } from '@rjsf/utils';
import { generateUID } from 'MAPI/utils';
import { compare } from 'utils/semver';
import { VersionImpl } from 'utils/Version';

import ClusterNameWidget from './ClusterNameWidget';

const uiSchemaProviderAWS: Record<string, GenericObjectType> = {
  0: {
    'ui:options': {
      order: [
        'clusterName',
        'clusterDescription',
        'organization',
        'controlPlane',
        '*',
      ],
    },
    clusterName: {
      'ui:options': {
        widget: ClusterNameWidget,
      },
    },
  },
};

const uiSchemaProviderAzure: Record<string, GenericObjectType> = {
  0: {
    'ui:options': {
      order: [
        'clusterName',
        'clusterDescription',
        'organization',
        'controlPlane',
        '*',
      ],
    },
    clusterName: {
      'ui:options': {
        widget: ClusterNameWidget,
      },
    },
  },
};

const uiSchemaProviderCloudDirector: Record<string, GenericObjectType> = {
  0: {
    'ui:options': {
      order: [
        'clusterDescription',
        'cluster',
        'organization',
        'controlPlane',
        '*',
      ],
    },
  },
};

const uiSchemaProviderGCP: Record<string, GenericObjectType> = {
  0: {
    'ui:options': {
      order: [
        'clusterName',
        'clusterDescription',
        'organization',
        'controlPlane',
        '*',
      ],
    },
    clusterName: {
      'ui:options': {
        widget: ClusterNameWidget,
      },
    },
  },
};

const uiSchemaProviderOpenStack: Record<string, GenericObjectType> = {
  0: {
    'ui:options': {
      order: [
        'clusterName',
        'clusterDescription',
        'organization',
        'controlPlane',
        '*',
      ],
    },
    clusterName: {
      'ui:options': {
        widget: ClusterNameWidget,
      },
    },
  },
};

const uiSchemaProviderVSphere: Record<string, GenericObjectType> = {
  0: {
    'ui:options': {
      order: ['cluster', 'controlPlane', '*'],
    },
    cluster: {
      'ui:options': {
        order: ['name', 'organization', '*'],
      },
      name: {
        'ui:options': {
          widget: ClusterNameWidget,
        },
      },
    },
  },
};

const uiSchemaTestSchema: Record<string, GenericObjectType> = {
  0: {
    'ui:options': {
      order: [
        'stringFields',
        'numericFields',
        'booleanFields',
        'objectFields',
        'arrayFields',
        '*',
      ],
    },
    stringFields: {
      'ui:options': {
        order: [
          'string',
          'stringEnum',
          'stringCustomLabels',
          'stringLength',
          'stringFormat',
          'stringPattern',
          '*',
        ],
      },
    },
    arrayFields: {
      'ui:options': {
        order: ['arrayOfStrings', 'arrayOfObjects', 'arrayMinMaxItems', '*'],
      },
    },
  },
};

export enum PrototypeProviders {
  AWS = 'aws',
  AZURE = 'azure',
  CLOUDDIRECTOR = 'cloud-director',
  GCP = 'gcp',
  OPENSTACK = 'open-stack',
  VSPHERE = 'vsphere',
}

export const prototypeProviders = Object.values(PrototypeProviders);

enum TestSchema {
  TEST = 'test',
}

export type PrototypeSchemas = TestSchema | PrototypeProviders;

export const prototypeSchemas = [
  ...Object.values(TestSchema),
  ...prototypeProviders,
];

export const getDefaultFormData = (
  schema: PrototypeSchemas,
  organization: string
) => {
  switch (schema) {
    case PrototypeProviders.AWS:
    case PrototypeProviders.AZURE:
    case PrototypeProviders.GCP:
    case PrototypeProviders.OPENSTACK:
      return {
        clusterName: generateUID(5),
        organization,
      };

    case PrototypeProviders.CLOUDDIRECTOR:
      return {
        organization,
      };

    case PrototypeProviders.VSPHERE:
      return {
        cluster: {
          name: generateUID(5),
          organization,
        },
      };

    default:
      return {};
  }
};

const uiSchemaForSchema: Record<PrototypeSchemas, UiSchema> = {
  [PrototypeProviders.AWS]: uiSchemaProviderAWS,
  [PrototypeProviders.AZURE]: uiSchemaProviderAzure,
  [PrototypeProviders.CLOUDDIRECTOR]: uiSchemaProviderCloudDirector,
  [PrototypeProviders.GCP]: uiSchemaProviderGCP,
  [PrototypeProviders.OPENSTACK]: uiSchemaProviderOpenStack,
  [PrototypeProviders.VSPHERE]: uiSchemaProviderVSphere,
  [TestSchema.TEST]: uiSchemaTestSchema,
};

export function getUiSchema(
  schema: PrototypeSchemas,
  version: string
): UiSchema {
  const majorVersion = new VersionImpl(version.slice(1)).getMajor();

  const uiSchema = uiSchemaForSchema[schema];

  const latestVersion = Object.keys(uiSchema).sort(compare)[0];

  // fallback to latest version if version specified by schema does
  // not have a corresponding ui schema
  return uiSchema[majorVersion] ?? uiSchema[latestVersion];
}