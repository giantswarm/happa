import { IState } from 'reducers/types';
import { Constants, Providers } from 'shared/constants';

enum Provider {
  AWS = 'aws',
  AZURE = 'azure',
  KVM = 'kvm',
}

export const getProvider = (state: IState): Provider =>
  state.main.info.general.provider;

export const getFirstNodePoolsRelease = (state: IState): string => {
  const provider = getProvider(state);
  let releaseVersion = '';

  switch (provider) {
    case Provider.AWS:
      releaseVersion = Constants.AWS_V5_VERSION;
      break;

    case Provider.AZURE:
      releaseVersion = Constants.AZURE_V5_VERSION;
      break;
  }

  if (state.main.info.features) {
    releaseVersion = state.main.info.features.nodepools.release_version_minimum;
  }

  return releaseVersion;
};

export const getAllowedInstanceTypeNames = (state: IState): string[] => {
  switch (state.main.info.general.provider) {
    case Providers.AWS:
      return state.main.info.workers.instance_type.options;
    case Providers.AZURE:
      return state.main.info.workers.vm_size.options;
    default:
      return [];
  }
};
