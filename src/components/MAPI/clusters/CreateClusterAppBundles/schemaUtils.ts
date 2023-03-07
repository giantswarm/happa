import { FormProps } from '@rjsf/core';
import { RJSFSchema, UiSchema } from '@rjsf/utils';
import cleanDeep, { CleanOptions } from 'clean-deep';
import { isEmpty, isPlainObject, transform } from 'lodash';
import { Providers } from 'model/constants';
import { pipe, traverseJSONSchemaObject } from 'utils/helpers';
import { compare } from 'utils/semver';
import { VersionImpl } from 'utils/Version';

import ClusterNameWidget from './custom-widgets/ClusterNameWidget';
import InstanceTypeWidget from './custom-widgets/InstanceTypeWidget';

export const prototypeProviders = [
  Providers.CAPA,
  Providers.CAPZ,
  Providers.CLOUDDIRECTOR,
  Providers.GCP,
  Providers.VSPHERE,
] as const;

export type PrototypeProviders = (typeof prototypeProviders)[number];

enum TestSchema {
  TEST = 'test',
}

export type PrototypeSchemas = TestSchema | PrototypeProviders;

export const prototypeSchemas = [
  ...Object.values(TestSchema),
  ...prototypeProviders,
];

export function getProviderForPrototypeSchema(
  schema: PrototypeSchemas
): PropertiesOf<typeof Providers> | undefined {
  switch (schema) {
    case TestSchema.TEST:
    case Providers.CLOUDDIRECTOR:
    case Providers.VSPHERE:
      return undefined;
    // TODO: Remove Providers.CAPZ mapping when support is implemented
    case Providers.CAPZ:
      return Providers.AZURE;
    default:
      return schema;
  }
}

interface FormPropsPartial {
  uiSchema: UiSchema;
  formData: (clusterName: string, organization: string) => RJSFSchema;
}

const formPropsProviderCAPA: Record<string, FormPropsPartial> = {
  0: {
    uiSchema: {
      'ui:order': [
        'clusterName',
        'clusterDescription',
        'organization',
        'controlPlane',
        '*',
      ],
      bastion: {
        instanceType: {
          'ui:widget': InstanceTypeWidget,
        },
      },
      clusterName: {
        'ui:widget': ClusterNameWidget,
      },
      controlPlane: {
        instanceType: {
          'ui:widget': InstanceTypeWidget,
        },
      },
    },
    formData: (clusterName, organization) => {
      return {
        clusterName,
        organization,
      };
    },
  },
};

const formPropsProviderCAPZ: Record<string, FormPropsPartial> = {
  0: {
    uiSchema: {
      'ui:order': [
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
      baseDomain: {
        'ui:widget': 'hidden',
      },
      connectivity: {
        'ui:order': ['sshSSOPublicKey', '*'],
        bastion: {
          instanceType: {
            'ui:widget': InstanceTypeWidget,
          },
        },
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
        instanceType: {
          'ui:widget': InstanceTypeWidget,
        },
        oidc: {
          'ui:order': ['issuerUrl', 'clientId', '*'],
        },
      },
      'cluster-shared': {
        'ui:widget': 'hidden',
      },
      machineDeployments: {
        items: {
          instanceType: {
            'ui:widget': InstanceTypeWidget,
          },
        },
      },
      machinePools: {
        'ui:widget': 'hidden',
      },
      managementCluster: {
        'ui:widget': 'hidden',
      },
      metadata: {
        'ui:order': ['name', 'description', '*'],
        name: {
          'ui:widget': ClusterNameWidget,
        },
        organization: {
          'ui:widget': 'hidden',
        },
      },
      provider: {
        'ui:widget': 'hidden',
      },
      providerSpecific: {
        'ui:order': ['location', 'subscriptionId', '*'],
      },
    },
    formData: (clusterName, organization) => {
      return {
        metadata: {
          name: clusterName,
          organization,
        },
      };
    },
  },
};

const formPropsProviderCloudDirector: Record<string, FormPropsPartial> = {
  0: {
    uiSchema: {
      'ui:order': [
        'clusterDescription',
        'cluster',
        'organization',
        'controlPlane',
        '*',
      ],
    },
    formData: (organization) => {
      return {
        organization,
      };
    },
  },
};

const formPropsProviderGCP: Record<string, FormPropsPartial> = {
  0: {
    uiSchema: {
      'ui:order': [
        'clusterName',
        'clusterDescription',
        'organization',
        'controlPlane',
        '*',
      ],
      bastion: {
        instanceType: {
          'ui:widget': InstanceTypeWidget,
        },
      },
      clusterName: {
        'ui:widget': ClusterNameWidget,
      },
      controlPlane: {
        instanceType: {
          'ui:widget': InstanceTypeWidget,
        },
      },
      machineDeployments: {
        items: {
          instanceType: {
            'ui:widget': InstanceTypeWidget,
          },
        },
      },
    },
    formData: (clusterName, organization) => {
      return {
        clusterName,
        organization,
      };
    },
  },
};

const formPropsProviderVSphere: Record<string, FormPropsPartial> = {
  0: {
    uiSchema: {
      'ui:order': ['cluster', 'controlPlane', '*'],
      cluster: {
        'ui:order': ['name', 'organization', '*'],
        name: {
          'ui:widget': ClusterNameWidget,
        },
      },
    },
    formData: (clusterName, organization) => {
      return {
        cluster: {
          name: clusterName,
          organization,
        },
      };
    },
  },
};

const formPropsTest: Record<string, FormPropsPartial> = {
  0: {
    uiSchema: {
      'ui:order': [
        'stringFields',
        'numericFields',
        'booleanFields',
        'objectFields',
        'arrayFields',
        '*',
      ],
      numericFields: {
        'ui:order': ['integer', 'integerLimit', '*'],
      },
      stringFields: {
        'ui:order': [
          'string',
          'stringEnum',
          'stringCustomLabels',
          'stringLength',
          'stringFormat',
          'stringPattern',
          '*',
        ],
      },
      arrayFields: {
        'ui:order': [
          'arrayOfStrings',
          'arrayOfObjects',
          'arrayOfObjectsWithTitle',
          'arrayMinMaxItems',
          '*',
        ],
      },
    },
    formData: (_organization) => {
      return {};
    },
  },
};

const formPropsByProvider: Record<
  PrototypeSchemas,
  Record<string, FormPropsPartial>
> = {
  [Providers.CAPZ]: formPropsProviderCAPZ,
  [Providers.CAPA]: formPropsProviderCAPA,
  [Providers.CLOUDDIRECTOR]: formPropsProviderCloudDirector,
  [Providers.GCP]: formPropsProviderGCP,
  [Providers.VSPHERE]: formPropsProviderVSphere,
  [TestSchema.TEST]: formPropsTest,
};

export function getFormProps(
  schema: PrototypeSchemas,
  version: string,
  clusterName: string,
  organization: string
): Pick<FormProps<RJSFSchema>, 'uiSchema' | 'formData'> {
  const formPropsByVersions = formPropsByProvider[schema];

  const majorVersion = new VersionImpl(version).getMajor();
  const latestVersion = Object.keys(formPropsByVersions).sort(compare)[0];

  const props =
    formPropsByVersions[majorVersion] ?? formPropsByVersions[latestVersion];

  return {
    uiSchema: props.uiSchema,
    formData: props.formData(clusterName, organization),
  };
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

export function preprocessSchema(
  schema: RJSFSchema,
  fieldsToRemove: string[] = ['.internal']
): RJSFSchema {
  const removeFields = ({
    obj,
    path,
  }: {
    obj: RJSFSchema;
    path?: string | null;
  }) => {
    for (const field of fieldsToRemove) {
      const fieldParentPath = field.slice(0, field.lastIndexOf('.'));
      const fieldKey = field.slice(field.lastIndexOf('.') + 1);

      if (fieldParentPath === path) {
        delete obj.properties?.[fieldKey];
      }
    }

    return { obj, path };
  };

  const processSubschemas = ({
    obj,
    path,
  }: {
    obj: RJSFSchema;
    path?: string | null;
  }) => {
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

    return { obj, path };
  };

  return traverseJSONSchemaObject(schema, (obj, path) =>
    pipe({ obj, path }, removeFields, processSubschemas)
  );
}
