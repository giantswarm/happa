import { IAzureMachinePool } from './';

export const labelControlPlane = 'cluster.x-k8s.io/control-plane';
export const labelAzureOperatorVersion = 'azure-operator.giantswarm.io/version';

export const tagAutoscalerMinSize = 'min';
export const tagAutoscalerMaxSize = 'max';

export function getAzureMachinePoolScaling(
  azureMachinePool: IAzureMachinePool
): readonly [number, number] {
  const tags = azureMachinePool.spec?.additionalTags;
  if (!tags) return [-1, -1];

  const minScaling = tags[tagAutoscalerMinSize];
  const maxScaling = tags[tagAutoscalerMaxSize];
  if (!minScaling || !maxScaling) return [-1, -1];

  try {
    return [parseInt(minScaling, 10), parseInt(maxScaling, 10)];
  } catch {
    return [-1, -1];
  }
}
