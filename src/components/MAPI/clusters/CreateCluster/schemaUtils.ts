import { GenericObjectType, UiSchema } from '@rjsf/utils';
import { generateUID } from 'MAPI/utils';

import ClusterNameWidget from './ClusterNameWidget';

export const prototypeProviders = [
  'AWS',
  'Cloud Director',
  'GCP',
  'Open Stack',
  'VSphere',
] as const;

export type PrototypeProviders = typeof prototypeProviders[number];

export const getDefaultFormData = (provider: PrototypeProviders) => {
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
      };
  }
};

const uiSchemaProviderDefault: Record<string, GenericObjectType> = {
  v0: {
    'ui:options': {
      order: ['clusterName', 'clusterDescription', '*'],
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
      order: ['cluster', '*'],
    },
    cluster: {
      'ui:options': {
        order: ['name', '*'],
      },
      name: {
        'ui:options': {
          widget: ClusterNameWidget,
        },
      },
    },
  },
};

export function getUiSchema(
  provider: PrototypeProviders,
  branchName: string
): UiSchema {
  // TODO: replace when we use app version instead of branch name
  const version = branchName.includes('release-')
    ? branchName.replace('release-', '')
    : 'v0.0.0';

  // select major version
  const majorVersion = version.split('.')[0];

  // eslint-disable-next-line @typescript-eslint/init-declarations
  let uiSchema;

  switch (provider) {
    case 'VSphere':
      uiSchema = uiSchemaProviderVSphere;
      break;

    default:
      uiSchema = uiSchemaProviderDefault;
      break;
  }

  return uiSchema[majorVersion];
}
