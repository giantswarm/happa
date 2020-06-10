import { IState } from 'reducers/types';

enum Provider {
  AWS = 'aws',
  AZURE = 'azure',
  KVM = 'kvm',
}

export const getProvider = (state: IState): Provider =>
  state.main.info.general.provider;

export const getFirstNodePoolsRelease = (state: IState): string =>
  state.main.info.features
    ? state.main.info.features.nodepools.release_version_minimum
    : '10.0.0';
