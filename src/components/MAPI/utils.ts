import { HttpClientFactory } from 'lib/hooks/useHttpClientFactory';
import { IOAuth2Provider } from 'lib/OAuth2/OAuth2';
import * as capiv1alpha3 from 'model/services/mapi/capiv1alpha3';
import * as capiexpv1alpha3 from 'model/services/mapi/capiv1alpha3/exp';
import * as capzv1alpha3 from 'model/services/mapi/capzv1alpha3';
import * as capzexpv1alpha3 from 'model/services/mapi/capzv1alpha3/exp';

import { ControlPlaneNodeList } from './types';

export interface IMachineType {
  cpu: number;
  memory: number;
}

export function getMachineTypes(): Record<string, IMachineType> {
  const machineTypes: Record<string, IMachineType> = {};

  if (window.config.awsCapabilitiesJSON) {
    const rawCapabilities: Record<string, IRawAWSInstanceType> = JSON.parse(
      window.config.awsCapabilitiesJSON
    );

    for (const [name, properties] of Object.entries(rawCapabilities)) {
      machineTypes[name] = {
        cpu: properties.cpu_cores,
        memory: properties.memory_size_gb,
      };
    }
  }

  if (window.config.azureCapabilitiesJSON) {
    const rawCapabilities: Record<string, IRawAzureInstanceType> = JSON.parse(
      window.config.azureCapabilitiesJSON
    );

    for (const [name, properties] of Object.entries(rawCapabilities)) {
      machineTypes[name] = {
        cpu: properties.numberOfCores,
        // eslint-disable-next-line no-magic-numbers
        memory: properties.memoryInMb / 1000,
      };
    }
  }

  return machineTypes;
}

export async function fetchNodePoolListForCluster(
  httpClientFactory: HttpClientFactory,
  auth: IOAuth2Provider,
  cluster?: capiv1alpha3.ICluster
) {
  const infrastructureRef = cluster?.spec?.infrastructureRef;
  if (!infrastructureRef) {
    return Promise.reject(
      new Error('There is no infrastructure reference defined.')
    );
  }

  switch (infrastructureRef.kind) {
    case capzv1alpha3.AzureCluster:
      return capiexpv1alpha3.getMachinePoolList(httpClientFactory(), auth, {
        labelSelector: {
          matchingLabels: {
            [capiv1alpha3.labelCluster]: cluster!.metadata.name,
          },
        },
      });

    // TODO(axbarsan): Use CAPA type once available.
    case 'AWSCluster':
      return capiv1alpha3.getMachineDeploymentList(httpClientFactory(), auth, {
        labelSelector: {
          matchingLabels: {
            [capiv1alpha3.labelCluster]: cluster!.metadata.name,
          },
        },
      });

    default:
      return Promise.reject(new Error('Unsupported provider.'));
  }
}

export function fetchNodePoolListForClusterKey(
  cluster?: capiv1alpha3.ICluster
) {
  const infrastructureRef = cluster?.spec?.infrastructureRef;
  if (
    !infrastructureRef ||
    typeof cluster?.metadata.deletionTimestamp !== 'undefined'
  ) {
    return null;
  }

  switch (infrastructureRef.kind) {
    case capzv1alpha3.AzureCluster:
      return capiexpv1alpha3.getMachinePoolListKey({
        labelSelector: {
          matchingLabels: {
            [capiv1alpha3.labelCluster]: cluster!.metadata.name,
          },
        },
      });

    // TODO(axbarsan): Use CAPA type once available.
    case 'AWSCluster':
      return capiv1alpha3.getMachineDeploymentListKey({
        labelSelector: {
          matchingLabels: {
            [capiv1alpha3.labelCluster]: cluster!.metadata.name,
          },
        },
      });

    default:
      return null;
  }
}

export async function fetchProviderNodePoolsForNodePools(
  httpClientFactory: HttpClientFactory,
  auth: IOAuth2Provider,
  nodePools: capiv1alpha3.IMachineDeployment[] | capiexpv1alpha3.IMachinePool[]
) {
  return Promise.all(
    nodePools.map(
      (np: capiv1alpha3.IMachineDeployment | capiexpv1alpha3.IMachinePool) => {
        const infrastructureRef = np.spec?.template.spec.infrastructureRef;
        if (!infrastructureRef) {
          return Promise.reject(
            new Error('There is no infrastructure reference defined.')
          );
        }

        switch (infrastructureRef.kind) {
          case capzexpv1alpha3.AzureMachinePool:
            return capzexpv1alpha3.getAzureMachinePool(
              httpClientFactory(),
              auth,
              np.metadata.namespace!,
              infrastructureRef.name
            );

          default:
            return Promise.reject(new Error('Unsupported provider.'));
        }
      }
    )
  );
}

export function fetchProviderNodePoolsForNodePoolsKey(
  nodePools?: capiv1alpha3.IMachineDeployment[] | capiexpv1alpha3.IMachinePool[]
) {
  if (!nodePools) return null;

  const keys = ['fetchProviderNodePoolsForNodePools/'];
  for (const np of nodePools) {
    if (np.spec?.template.spec.infrastructureRef) {
      keys.push(np.metadata.name);
    }
  }

  return keys.join();
}

export async function fetchMasterListForCluster(
  httpClientFactory: HttpClientFactory,
  auth: IOAuth2Provider,
  cluster: capiv1alpha3.ICluster
): Promise<ControlPlaneNodeList> {
  const infrastructureRef = cluster.spec?.infrastructureRef;
  if (!infrastructureRef) {
    return Promise.reject(
      new Error('There is no infrastructure reference defined.')
    );
  }

  switch (infrastructureRef.kind) {
    case capzv1alpha3.AzureCluster:
      return capzv1alpha3.getAzureMachineList(httpClientFactory(), auth, {
        labelSelector: {
          matchingLabels: {
            [capiv1alpha3.labelCluster]: cluster.metadata.name,
            [capzv1alpha3.labelControlPlane]: 'true',
          },
        },
      });

    default:
      return Promise.reject(new Error('Unsupported provider.'));
  }
}

export function fetchMasterListForClusterKey(cluster: capiv1alpha3.ICluster) {
  const infrastructureRef = cluster.spec?.infrastructureRef;
  if (!infrastructureRef) {
    return null;
  }

  switch (infrastructureRef.kind) {
    case capzv1alpha3.AzureCluster:
      return capzv1alpha3.getAzureMachineListKey({
        labelSelector: {
          matchingLabels: {
            [capiv1alpha3.labelCluster]: cluster.metadata.name,
          },
        },
      });

    default:
      return null;
  }
}
