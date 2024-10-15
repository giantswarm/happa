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
  formData: (
    clusterName: string,
    organization: string,
    releaseVersion?: string
  ) => RJSFSchema;
}

const formPropsProviderCAPA: Record<string, FormPropsPartial> = {
  0: {
    uiSchema: {
      'ui:order': ['global', '*'],
      baseDomain: {
        'ui:widget': 'hidden',
      },
      cluster: {
        'ui:widget': 'hidden',
      },
      global: {
        connectivity: {
          'ui:order': ['sshSsoPublicKey', '*'],
          baseDomain: {
            'ui:widget': 'hidden',
          },
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
        providerSpecific: {
          'ui:order': [
            'region',
            'flatcarAwsAccount',
            'awsClusterRoleIdentityName',
            '*',
          ],
        },
        managementCluster: {
          'ui:widget': 'hidden',
        },
        kubectlImage: {
          'ui:widget': 'hidden',
        },
        metadata: {
          'ui:order': ['name', 'description', '*'],
          name: {
            'ui:widget': ClusterNameWidget,
          },
        },
        nodePools: {
          items: {
            instanceType: {
              'ui:widget': InstanceTypeWidget,
            },
          },
        },
        release: {
          version: {
            'ui:disabled': true,
          },
        },
      },
      managementCluster: {
        'ui:widget': 'hidden',
      },
      provider: {
        'ui:widget': 'hidden',
      },
      'cluster-shared': {
        'ui:widget': 'hidden',
      },
    },
    formData: (clusterName, organization, releaseVersion) => {
      return {
        global: {
          metadata: {
            name: clusterName,
            organization,
          },
          release: {
            version: releaseVersion,
          },
        },
      };
    },
  },
};

const formPropsProviderCAPZ: Record<string, FormPropsPartial> = {
  0: {
    uiSchema: {
      'ui:order': ['global', '*'],
      baseDomain: {
        'ui:widget': 'hidden',
      },
      cluster: {
        'ui:widget': 'hidden',
      },
      global: {
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
        nodePools: {
          items: {
            instanceType: {
              'ui:widget': InstanceTypeWidget,
            },
          },
        },
        provider: {
          'ui:widget': 'hidden',
        },
        providerSpecific: {
          'ui:order': ['location', 'subscriptionId', '*'],
        },
      },
      managementCluster: {
        'ui:widget': 'hidden',
      },
      provider: {
        'ui:widget': 'hidden',
      },
      'cluster-shared': {
        'ui:widget': 'hidden',
      },
    },
    formData: (clusterName, organization) => {
      return {
        global: {
          metadata: {
            name: clusterName,
            organization,
          },
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
    formData: (_clusterName, organization) => {
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
      'ui:order': ['global', '*'],
      baseDomain: {
        'ui:widget': 'hidden',
      },
      cluster: {
        'ui:widget': 'hidden',
      },
      global: {
        metadata: {
          'ui:order': ['name', 'description', '*'],
          name: {
            'ui:widget': ClusterNameWidget,
          },
        },
      },
      managementCluster: {
        'ui:widget': 'hidden',
      },
      provider: {
        'ui:widget': 'hidden',
      },
      'cluster-shared': {
        'ui:widget': 'hidden',
      },
    },
    formData: (clusterName, organization) => {
      return {
        global: {
          metadata: {
            name: clusterName,
            organization,
          },
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
    formData: (_clusterName, _organization) => {
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
  releaseVersion?: string
): Pick<FormProps<RJSFSchema>, 'uiSchema' | 'formData'> {
  const formPropsByVersions = formPropsByProvider[schema];

  const majorVersion = new VersionImpl(version).getMajor();
  const latestVersion = Object.keys(formPropsByVersions).sort(compare)[0];

  const props =
    formPropsByVersions[majorVersion] ?? formPropsByVersions[latestVersion];

  return {
    uiSchema: props.uiSchema,
    formData: props.formData(clusterName, organization, releaseVersion),
  };
}
