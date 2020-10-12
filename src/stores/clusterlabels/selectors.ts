import { IState } from 'stores/state';

export function getClusterLabelsLoading(state: IState) {
  return state.entities.clusterLabels.requestInProgress;
}

export function getClusterLabelsError(state: IState) {
  return state.entities.clusterLabels.error;
}
