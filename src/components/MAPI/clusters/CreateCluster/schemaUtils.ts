import { GenericObjectType, RJSFSchema, UiSchema } from '@rjsf/utils';
import cleanDeep, { CleanOptions } from 'clean-deep';
import { isEmpty, isPlainObject, transform } from 'lodash';
import { generateUID } from 'MAPI/utils';
import { traverseJSONSchemaObject } from 'utils/helpers';
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
        'metadata',
        'providerSpecific',
        'controlPlane',
        'connectivity',
        'nodePools',
        'machineDeployments',
        'kubernetesVersion',
        'includeClusterResourceSet',
        '*',
      ],
    },
    connectivity: {
      'ui:order': ['sshSSOPublicKey', '*'],
      network: {
        'ui:order': ['hostCidr', 'podCidr', 'serviceCidr', 'mode', '*'],
      },
    },
    controlPlane: {
      'ui:order': [
        'instanceType',
        'replicas',
        'rootVolumeSizeGB',
        'etcdVolumeSizeGB',
        '*',
      ],
      oidc: {
        'ui:order': ['issuerUrl', 'clientId', '*'],
      },
    },
    metadata: {
      'ui:order': ['name', 'description', '*'],
      name: {
        'ui:options': {
          widget: ClusterNameWidget,
        },
      },
      organization: {
        'ui:widget': 'hidden',
        'ui:options': {
          label: false,
        },
      },
    },
    providerSpecific: {
      'ui:order': ['location', 'subscriptionId', '*'],
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
    numericFields: {
      'ui:options': {
        order: ['integer', 'integerLimit', '*'],
      },
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
        order: [
          'arrayOfStrings',
          'arrayOfObjects',
          'arrayOfObjectsWithTitle',
          'arrayMinMaxItems',
          '*',
        ],
      },
    },
  },
};

export enum PrototypeProviders {
  AWS = 'aws',
  AZURE = 'azure',
  CLOUDDIRECTOR = 'cloud-director',
  GCP = 'gcp',
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
    case PrototypeProviders.AZURE:
      return {
        metadata: {
          name: generateUID(5),
          organization,
        },
      };
    case PrototypeProviders.AWS:
    case PrototypeProviders.GCP:
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

export function cleanDeepWithException<T>(
  object: Iterable<T> | unknown,
  options?: CleanOptions,
  isException?: (value: unknown) => boolean
): Iterable<T> | unknown {
  const {
    emptyArrays = true,
    emptyObjects = true,
    undefinedValues = true,
  } = options ?? {};

  return transform(
    object as unknown[],
    (result: Record<string | number, unknown>, value, key) => {
      // if it matches the exception rule, don't continue to clean
      if (isException && isException(value)) {
        result[key] = value;

        return;
      }

      let newValue = value;
      if (Array.isArray(value) || isPlainObject(value)) {
        newValue = cleanDeepWithException<unknown>(value, options, isException);
        if (
          ((isPlainObject(newValue) && emptyObjects) ||
            (Array.isArray(newValue) && emptyArrays)) &&
          isEmpty(newValue)
        ) {
          return;
        }
      } else {
        newValue =
          value !== 0 && !value ? cleanDeep({ value }, options).value : value;
        if (
          newValue === undefined &&
          (value !== undefined || undefinedValues)
        ) {
          return;
        }
      }

      if (Array.isArray(result)) {
        result.push(newValue);
      } else {
        result[key] = newValue;
      }
    }
  );
}

export function preprocessSchema(schema: RJSFSchema): RJSFSchema {
  const processSubschemas = (obj: RJSFSchema) => {
    // If the type is not defined and the schema uses 'anyOf' or 'oneOf',
    // use first not deprecated subschema from the list
    if (!obj.type && (obj.anyOf || obj.oneOf)) {
      const subschemas = (obj.anyOf || obj.oneOf || []).filter(
        (subschema) =>
          typeof subschema === 'object' && !(subschema as RJSFSchema).deprecated
      );

      if (subschemas.length > 0) {
        Object.entries(subschemas[0]).forEach(([key, value]) => {
          obj[key] = value;
        });
      }

      delete obj.anyOf;
      delete obj.oneOf;
    }

    return obj;
  };

  return traverseJSONSchemaObject(schema, processSubschemas);
}
