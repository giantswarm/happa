import { IState } from 'reducers/types';
import { getProvider } from 'selectors/mainInfoSelectors';
import { Constants, Providers } from 'shared/constants';

export function getMinHAMastersVersion(state: IState): string {
  const provider = getProvider(state);
  let releaseVersion = '';

  switch (provider) {
    case Providers.AWS:
      releaseVersion = Constants.AWS_HA_MASTERS_VERSION;
      break;
  }

  if (state.main.info.features?.ha_masters?.release_version_minimum) {
    releaseVersion =
      state.main.info.features.ha_masters.release_version_minimum;
  }

  return releaseVersion;
}
