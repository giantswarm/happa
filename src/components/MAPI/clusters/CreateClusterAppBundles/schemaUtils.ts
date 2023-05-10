import { FormProps } from '@rjsf/core';
import { RJSFSchema, UiSchema } from '@rjsf/utils';
import { Providers } from 'model/constants';
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
    default:
      return schema;
  }
}

interface FormPropsPartial {
  uiSchema: UiSchema<RJSFSchema>;
  formData: (clusterName: string, organization: string) => RJSFSchema;
}

const formPropsProviderCAPA: Record<string, FormPropsPartial> = {
  0: {
    uiSchema: {
      'ui:order': [
        'metadata',
        'providerSpecific',
        'controlPlane',
        'connectivity',
        'nodePools',
        '*',
      ],
      baseDomain: {
        'ui:widget': 'hidden',
      },
      connectivity: {
        'ui:order': ['sshSsoPublicKey', '*'],
        bastion: {
          instanceType: {
            'ui:widget': InstanceTypeWidget,
          },
        },
      },
      controlPlane: {
        'ui:order': [
          'apiMode',
          'instanceType',
          'replicas',
          'rootVolumeSizeGB',
          'etcdVolumeSizeGB',
          'kubeletVolumeSizeGB',
          'containerdVolumeSizeGB',
          'oidc',
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
      defaultMachinePools: {
        'ui:widget': 'hidden',
      },
      kubectlImage: {
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
      },
      provider: {
        'ui:widget': 'hidden',
      },
      providerSpecific: {
        'ui:order': [
          'region',
          'flatcarAwsAccount',
          'awsClusterRoleIdentityName',
          '*',
        ],
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
  organization: string,
  existingFormData?: RJSFSchema
): Pick<FormProps<RJSFSchema>, 'uiSchema' | 'formData'> {
  const formPropsByVersions = formPropsByProvider[schema];

  const majorVersion = new VersionImpl(version).getMajor();
  const latestVersion = Object.keys(formPropsByVersions).sort(compare)[0];

  const props =
    formPropsByVersions[majorVersion] ?? formPropsByVersions[latestVersion];

  return {
    uiSchema: props.uiSchema,
    formData: existingFormData ?? props.formData(clusterName, organization),
  };
}
