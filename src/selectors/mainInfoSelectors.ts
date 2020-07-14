import { IState } from 'reducers/types';
import { Providers } from 'shared/constants';
import { PropertiesOf } from 'shared/types';

export const getProvider = (state: IState): PropertiesOf<typeof Providers> =>
  state.main.info.general.provider;

export const getFirstNodePoolsRelease = (state: IState): string =>
  state.main.info.features
    ? state.main.info.features.nodepools.release_version_minimum
    : '10.0.0';

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
