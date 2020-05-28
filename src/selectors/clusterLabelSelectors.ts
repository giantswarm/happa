import { IState } from 'reducers/types';

export const getClusterLabelsLoading = (state: IState): string =>
  state.entities.clusterLabels.requestInProgress;

export const getClusterLabelsError = (state: IState): Error | null =>
  state.entities.clusterLabels.error;
