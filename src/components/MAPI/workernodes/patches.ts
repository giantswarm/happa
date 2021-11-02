import { NodePool, ProviderNodePool } from 'MAPI/types';
import * as capiexpv1alpha3 from 'model/services/mapi/capiv1alpha3/exp';

export type NodePoolPatch = (
  nodePool: NodePool,
  providerNodePool: ProviderNodePool
) => void;

export interface INodePoolPropertyValue {
  patch: NodePoolPatch;
  isValid: boolean;
}

export interface INodePoolPropertyProps {
  id: string;
  nodePool: NodePool;
  providerNodePool: ProviderNodePool;
  onChange: (value: INodePoolPropertyValue) => void;
  disabled?: boolean;
  readOnly?: boolean;
}

export function withNodePoolDescription(newDescription: string): NodePoolPatch {
  return (nodePool, providerNodePool) => {
    if (nodePool.kind === capiexpv1alpha3.MachinePool) {
      nodePool.metadata.annotations ??= {};
      nodePool.metadata.annotations[
        capiexpv1alpha3.annotationMachinePoolDescription
      ] = newDescription;
    } else if (
      providerNodePool?.apiVersion === 'infrastructure.giantswarm.io/v1alpha3'
    ) {
      providerNodePool.spec.nodePool.description = newDescription;
    }
  };
}

export interface INodePoolMachineTypesConfigAzure {
  primary: string;
}

export interface INodePoolMachineTypesConfigAWS {
  primary: string;
  similarInstances: boolean;
}

export type NodePoolMachineTypesConfig =
  | INodePoolMachineTypesConfigAzure
  | INodePoolMachineTypesConfigAWS;

export function withNodePoolMachineType(
  config: NodePoolMachineTypesConfig
): NodePoolPatch {
  return (_, providerNodePool) => {
    switch (providerNodePool?.apiVersion) {
      case 'exp.infrastructure.cluster.x-k8s.io/v1alpha3':
        providerNodePool.spec!.template.vmSize = config.primary;
        break;
      case 'infrastructure.giantswarm.io/v1alpha3':
        providerNodePool.spec.provider.worker.instanceType = config.primary;
        providerNodePool.spec.provider.worker.useAlikeInstanceTypes = (
          config as INodePoolMachineTypesConfigAWS
        ).similarInstances;
        break;
    }
  };
}

export function withNodePoolAvailabilityZones(zones?: string[]): NodePoolPatch {
  return (nodePool, providerNodePool) => {
    if (nodePool.kind === capiexpv1alpha3.MachinePool) {
      nodePool.spec!.failureDomains = zones;
    } else if (
      providerNodePool?.apiVersion === 'infrastructure.giantswarm.io/v1alpha3'
    ) {
      providerNodePool.spec.provider.availabilityZones = zones ?? [];
    }
  };
}

export function withNodePoolScaling(min: number, max: number): NodePoolPatch {
  return (nodePool, providerNodePool) => {
    if (nodePool.kind === capiexpv1alpha3.MachinePool) {
      nodePool.spec!.replicas = min;

      nodePool.metadata.annotations ??= {};
      nodePool.metadata.annotations[
        capiexpv1alpha3.annotationMachinePoolMinSize
      ] = min.toString();
      nodePool.metadata.annotations[
        capiexpv1alpha3.annotationMachinePoolMaxSize
      ] = max.toString();
    } else if (
      providerNodePool?.apiVersion === 'infrastructure.giantswarm.io/v1alpha3'
    ) {
      providerNodePool.spec.nodePool.scaling.min = min;
      providerNodePool.spec.nodePool.scaling.max = max;
    }
  };
}

export interface INodePoolSpotInstancesConfigAzure {
  enabled: boolean;
  maxPrice: string;
}

export interface INodePoolSpotInstancesConfigAWS {
  enabled: boolean;
  onDemandBaseCapacity: number;
  onDemandPercentageAboveBaseCapacity: number;
}

export type NodePoolSpotInstancesConfig =
  | INodePoolSpotInstancesConfigAzure
  | INodePoolSpotInstancesConfigAWS;

export function withNodePoolSpotInstances(
  config: NodePoolSpotInstancesConfig
): NodePoolPatch {
  return (_, providerNodePool: ProviderNodePool) => {
    switch (providerNodePool?.apiVersion) {
      case 'exp.infrastructure.cluster.x-k8s.io/v1alpha3':
        if (!config.enabled) {
          providerNodePool.spec!.template.spotVMOptions = undefined;

          return;
        }

        providerNodePool.spec!.template.spotVMOptions ??= {};
        providerNodePool.spec!.template.spotVMOptions.maxPrice = (
          config as INodePoolSpotInstancesConfigAzure
        ).maxPrice;
        providerNodePool.spec!.template.spotVMOptions.maxPrice ||= '-1';

        break;

      case 'infrastructure.giantswarm.io/v1alpha3':
        providerNodePool.spec.provider.instanceDistribution = {
          onDemandBaseCapacity: (config as INodePoolSpotInstancesConfigAWS)
            .onDemandBaseCapacity,
          onDemandPercentageAboveBaseCapacity: (
            config as INodePoolSpotInstancesConfigAWS
          ).onDemandPercentageAboveBaseCapacity,
        };

        break;
    }
  };
}
