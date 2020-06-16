import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getProvider } from 'selectors/mainInfoSelectors';

interface IUseReleaseNotesURL {
  (version: string): string;
}

const useReleaseNotesURL: IUseReleaseNotesURL = (version) => {
  const provider = useSelector(getProvider);

  const url = useMemo(
    () =>
      `https://github.com/giantswarm/releases/blob/master/${provider}/v${version}/release-notes.md`,
    [provider, version]
  );

  return url;
};

export default useReleaseNotesURL;
