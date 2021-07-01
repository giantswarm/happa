import produce from 'immer';
import { IOAuth2Provider } from 'lib/OAuth2/OAuth2';
import { NodePool } from 'MAPI/types';
import { compareNodePools } from 'MAPI/utils';
import { IHttpClient } from 'model/clients/HttpClient';
import * as capiv1alpha3 from 'model/services/mapi/capiv1alpha3';
import * as capiexpv1alpha3 from 'model/services/mapi/capiv1alpha3/exp';
import { mutate } from 'swr';

export async function updateNodePoolDescription(
  httpClient: IHttpClient,
  auth: IOAuth2Provider,
  nodePool: NodePool,
  newDescription: string
) {
  if (nodePool.kind === capiexpv1alpha3.MachinePool) {
    let machinePool = await capiexpv1alpha3.getMachinePool(
      httpClient,
      auth,
      nodePool.metadata.namespace!,
      nodePool.metadata.name
    );
    const description = capiexpv1alpha3.getMachinePoolDescription(machinePool);
    if (description === newDescription) {
      return machinePool;
    }

    machinePool.metadata.annotations ??= {};
    machinePool.metadata.annotations[
      capiexpv1alpha3.annotationMachinePoolDescription
    ] = newDescription;

    machinePool = await capiexpv1alpha3.updateMachinePool(
      httpClient,
      auth,
      machinePool
    );

    mutate(
      capiexpv1alpha3.getMachinePoolKey(
        machinePool.metadata.namespace!,
        machinePool.metadata.name
      ),
      machinePool
    );

    mutate(
      capiexpv1alpha3.getMachinePoolListKey({
        labelSelector: {
          matchingLabels: {
            [capiv1alpha3.labelCluster]: machinePool.metadata.labels![
              capiv1alpha3.labelCluster
            ],
          },
        },
      })
    );

    return machinePool;
  }

  return Promise.reject(new Error('Unsupported provider.'));
}

export async function deleteNodePool(
  httpClient: IHttpClient,
  auth: IOAuth2Provider,
  nodePool: NodePool
) {
  if (nodePool.kind === capiexpv1alpha3.MachinePool) {
    let machinePool = await capiexpv1alpha3.getMachinePool(
      httpClient,
      auth,
      nodePool.metadata.namespace!,
      nodePool.metadata.name
    );

    machinePool = await capiexpv1alpha3.deleteMachinePool(
      httpClient,
      auth,
      machinePool
    );

    mutate(
      capiexpv1alpha3.getMachinePoolKey(
        machinePool.metadata.namespace!,
        machinePool.metadata.name
      ),
      machinePool
    );

    // Update the deleted machine pool in place.
    mutate(
      capiexpv1alpha3.getMachinePoolListKey({
        labelSelector: {
          matchingLabels: {
            [capiv1alpha3.labelCluster]: machinePool.metadata.labels![
              capiv1alpha3.labelCluster
            ],
          },
        },
      }),
      produce((draft: capiexpv1alpha3.IMachinePoolList) => {
        for (let i = 0; i < draft.items.length; i++) {
          if (draft.items[i].metadata.name === machinePool.metadata.name) {
            draft.items[i] = machinePool;
          }
        }

        draft.items = draft.items.sort(compareNodePools);

        return draft;
      }),
      false
    );

    return machinePool;
  }

  return Promise.reject(new Error('Unsupported provider.'));
}

export async function updateNodePoolScaling(
  httpClient: IHttpClient,
  auth: IOAuth2Provider,
  nodePool: NodePool,
  min: number,
  max: number
) {
  if (nodePool.kind === capiexpv1alpha3.MachinePool) {
    let machinePool = await capiexpv1alpha3.getMachinePool(
      httpClient,
      auth,
      nodePool.metadata.namespace!,
      nodePool.metadata.name
    );

    if (
      nodePool.metadata.annotations?.[
        capiexpv1alpha3.annotationMachinePoolMinSize
      ] === min.toString() &&
      nodePool.metadata.annotations?.[
        capiexpv1alpha3.annotationMachinePoolMaxSize
      ] === max.toString()
    ) {
      return machinePool;
    }

    machinePool.metadata.annotations ??= {};
    machinePool.metadata.annotations[
      capiexpv1alpha3.annotationMachinePoolMinSize
    ] = min.toString();
    machinePool.metadata.annotations[
      capiexpv1alpha3.annotationMachinePoolMaxSize
    ] = max.toString();

    machinePool = await capiexpv1alpha3.updateMachinePool(
      httpClient,
      auth,
      machinePool
    );

    mutate(
      capiexpv1alpha3.getMachinePoolKey(
        machinePool.metadata.namespace!,
        machinePool.metadata.name
      ),
      machinePool
    );

    // Update the deleted machine pool in place.
    mutate(
      capiexpv1alpha3.getMachinePoolListKey({
        labelSelector: {
          matchingLabels: {
            [capiv1alpha3.labelCluster]: machinePool.metadata.labels![
              capiv1alpha3.labelCluster
            ],
          },
        },
      }),
      produce((draft: capiexpv1alpha3.IMachinePoolList) => {
        for (let i = 0; i < draft.items.length; i++) {
          if (draft.items[i].metadata.name === machinePool.metadata.name) {
            draft.items[i] = machinePool;
          }
        }

        draft.items = draft.items.sort(compareNodePools);

        return draft;
      }),
      false
    );

    return machinePool;
  }

  return Promise.reject(new Error('Unsupported provider.'));
}
