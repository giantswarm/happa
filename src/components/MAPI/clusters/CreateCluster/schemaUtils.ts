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
  0: {},
};

export const prototypeProviders = [
  'AWS',
  'Azure',
  'Cloud Director',
  'GCP',
  'Open Stack',
  'VSphere',
] as const;

export type PrototypeProviders = typeof prototypeProviders[number];

export type PrototypeSchemas = 'Test Schema' | PrototypeProviders;

export const prototypeSchemas: PrototypeSchemas[] = [
  'Test Schema',
  ...prototypeProviders,
];

export const getDefaultFormData = (
  schema: PrototypeSchemas,
  organization: string
) => {
  switch (schema) {
    case 'AWS':
    case 'Azure':
    case 'GCP':
    case 'Open Stack':
      return {
        clusterName: generateUID(5),
        organization,
      };

    case 'Cloud Director':
      return {
        organization,
      };

    case 'VSphere':
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
  AWS: uiSchemaProviderAWS,
  Azure: uiSchemaProviderAzure,
  'Cloud Director': uiSchemaProviderCloudDirector,
  GCP: uiSchemaProviderGCP,
  'Open Stack': uiSchemaProviderOpenStack,
  VSphere: uiSchemaProviderVSphere,
  'Test Schema': uiSchemaTestSchema,
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
