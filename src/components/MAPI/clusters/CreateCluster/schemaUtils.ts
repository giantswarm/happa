import { GenericObjectType, UiSchema } from '@rjsf/utils';
import { generateUID } from 'MAPI/utils';
import { compare } from 'utils/semver';

import ClusterNameWidget from './ClusterNameWidget';

const uiSchemaProviderAWS: Record<string, GenericObjectType> = {
  v0: {
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
  v0: {
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
  v0: {
    'ui:options': {
      order: [
        'clusterDescription',
        'cluster',
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

const uiSchemaProviderGCP: Record<string, GenericObjectType> = {
  v0: {
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
  v0: {
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
  v0: {
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

export const prototypeProviders = [
  'AWS',
  'Azure',
  'Cloud Director',
  'GCP',
  'Open Stack',
  'VSphere',
] as const;

export type PrototypeProviders = typeof prototypeProviders[number];

export const getDefaultFormData = (
  provider: PrototypeProviders,
  organization: string
) => {
  switch (provider) {
    case 'VSphere':
      return {
        cluster: {
          name: generateUID(5),
        },
      };
    default:
      return {
        clusterName: generateUID(5),
        organization,
      };
  }
};

const uiSchemaForProvider: Record<PrototypeProviders, UiSchema> = {
  AWS: uiSchemaProviderAWS,
  Azure: uiSchemaProviderAzure,
  'Cloud Director': uiSchemaProviderCloudDirector,
  GCP: uiSchemaProviderGCP,
  'Open Stack': uiSchemaProviderOpenStack,
  VSphere: uiSchemaProviderVSphere,
};

export function getUiSchema(
  provider: PrototypeProviders,
  version: string
): UiSchema {
  // select major version
  const majorVersion = version.split('.')[0];

  const uiSchema = uiSchemaForProvider[provider];

  const latestVersion = Object.keys(uiSchema).sort(compare)[0];

  // fallback to latest version if version specified by schema does
  // not have a corresponding ui schema
  return uiSchema[majorVersion] ?? uiSchema[latestVersion];
}
